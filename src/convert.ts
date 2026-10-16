import HTMLtoDOCX from "html-to-docx"
import mammoth from "mammoth"
import { marked } from "marked"
import { PDFDocument } from "pdf-lib"
import TurndownService from "turndown"
import * as XLSX from "xlsx"
import { extensionFor, type Kind } from "./kinds"

const turndown = new TurndownService()

export type FileBytes = {
  path: string
  name: string
  data: Uint8Array
}

export type Converted = {
  name: string
  data: Uint8Array
}

export type ImageFormat = "png" | "jpg"

export type Helpers = {
  htmlToPdf: (html: string) => Promise<Uint8Array>
  htmlToImages: (html: string, format: ImageFormat) => Promise<Uint8Array[]>
  pdfToText: (filePath: string) => Promise<string>
  pdfToImages: (filePath: string, format: ImageFormat) => Promise<Uint8Array[]>
  transcodeImage: (filePath: string, target: "png" | "jpg" | "webp") => Promise<Uint8Array>
}

export async function convertFile(input: FileBytes, target: Kind, helpers: Partial<Helpers> = {}): Promise<Converted[]> {
  const source = kindFromName(input.name)
  const base = input.name.replace(/\.[^.]+$/, "") || "converted"
  const named = (kind: Kind, data: Uint8Array, suffix = ""): Converted => ({
    name: `${base}${suffix}.${extensionFor(kind)}`,
    data,
  })
  const pagesOf = (kind: Kind, pages: Uint8Array[]): Converted[] =>
    pages.map((data, index) => named(kind, data, pages.length > 1 ? `-page-${index + 1}` : ""))

  if (isImage(source)) {
    if (target === "pdf") {
      const png = source === "png" ? input.data : await need(helpers, "transcodeImage")(input.path, "png")
      return [named("pdf", await imagesToPdf([png]))]
    }
    if (target === "png" || target === "jpg" || target === "webp") {
      return [named(target, await need(helpers, "transcodeImage")(input.path, target))]
    }
    throw new Error(`Cannot convert ${input.name} to ${target}.`)
  }

  if (target === "png" || target === "jpg") {
    if (source === "pdf") return pagesOf(target, await need(helpers, "pdfToImages")(input.path, target))
    const html = await asHtml(source, input)
    return pagesOf(target, await need(helpers, "htmlToImages")(html, target))
  }

  switch (pair(source, target)) {
    case "md->html":
      return [named("html", bytes(await markdownToHtml(text(input.data))))]
    case "md->txt":
      return [named("txt", bytes(markdownToText(text(input.data))))]
    case "md->docx":
      return [named("docx", await htmlToDocx(await markdownToHtml(text(input.data))))]
    case "md->pdf":
      return [named("pdf", await need(helpers, "htmlToPdf")(await markdownToHtml(text(input.data))))]
    case "md->csv":
    case "md->json":
    case "md->xlsx":
    case "md->tsv":
      return tabularOutput(named, target, markdownToBook(text(input.data)), helpers)
    case "html->md":
      return [named("md", bytes(turndown.turndown(text(input.data))))]
    case "html->txt":
      return [named("txt", bytes(htmlToText(text(input.data))))]
    case "html->docx":
      return [named("docx", await htmlToDocx(text(input.data)))]
    case "html->pdf":
      return [named("pdf", await need(helpers, "htmlToPdf")(text(input.data)))]
    case "html->csv":
    case "html->json":
    case "html->xlsx":
    case "html->tsv":
      return tabularOutput(named, target, htmlToBook(text(input.data)), helpers)
    case "txt->md":
      return [named("md", input.data)]
    case "txt->html":
      return [named("html", bytes(textToHtml(text(input.data))))]
    case "txt->docx":
      return [named("docx", await htmlToDocx(textToHtml(text(input.data))))]
    case "txt->pdf":
      return [named("pdf", await need(helpers, "htmlToPdf")(textToHtml(text(input.data))))]
    case "docx->html":
      return [named("html", bytes(await docxHtml(input.data)))]
    case "docx->md":
      return [named("md", bytes(turndown.turndown(await docxHtml(input.data))))]
    case "docx->txt":
      return [named("txt", bytes((await mammoth.extractRawText({ buffer: Buffer.from(input.data) })).value))]
    case "docx->pdf":
      return [named("pdf", await need(helpers, "htmlToPdf")(await docxHtml(input.data)))]
    case "rtf->txt":
    case "rtf->md":
      return [named(target, bytes(rtfToText(text(input.data))))]
    case "rtf->html":
      return [named("html", bytes(textToHtml(rtfToText(text(input.data)))))]
    case "rtf->docx":
      return [named("docx", await htmlToDocx(textToHtml(rtfToText(text(input.data)))))]
    case "rtf->pdf":
      return [named("pdf", await need(helpers, "htmlToPdf")(textToHtml(rtfToText(text(input.data)))))]
    case "pdf->txt":
      return [named("txt", bytes(await need(helpers, "pdfToText")(input.path)))]
    case "pdf->md":
      return [named("md", bytes(await need(helpers, "pdfToText")(input.path)))]
    case "pdf->html":
      return [named("html", bytes(textToHtml(await need(helpers, "pdfToText")(input.path))))]
    case "pdf->docx":
      return [named("docx", await htmlToDocx(textToHtml(await need(helpers, "pdfToText")(input.path))))]
    case "csv->json":
    case "csv->xlsx":
    case "csv->md":
    case "csv->html":
    case "csv->txt":
    case "csv->tsv":
    case "csv->pdf":
      return tabularOutput(named, target, readSheet(input.data, "csv"), helpers)
    case "tsv->csv":
    case "tsv->json":
    case "tsv->xlsx":
    case "tsv->md":
    case "tsv->html":
    case "tsv->txt":
    case "tsv->pdf":
      return tabularOutput(named, target, readSheet(input.data, "tsv"), helpers)
    case "json->csv":
    case "json->xlsx":
    case "json->md":
    case "json->html":
    case "json->txt":
    case "json->tsv":
    case "json->pdf":
      return tabularOutput(named, target, jsonToBook(text(input.data)), helpers)
    case "xlsx->csv":
    case "xlsx->json":
    case "xlsx->md":
    case "xlsx->html":
    case "xlsx->txt":
    case "xlsx->tsv":
    case "xlsx->pdf":
      return tabularOutput(named, target, readSheet(input.data, "xlsx"), helpers)
    case "ods->xlsx":
    case "ods->csv":
    case "ods->json":
    case "ods->md":
    case "ods->html":
    case "ods->txt":
    case "ods->tsv":
    case "ods->pdf":
      return tabularOutput(named, target, readSheet(input.data, "ods"), helpers)
    default:
      throw new Error(`Cannot convert ${input.name} to ${target}.`)
  }
}

function pair(source: Kind, target: Kind): string {
  return `${source}->${target}`
}

function kindFromName(name: string): Kind {
  const ext = name.split(".").pop()?.toLowerCase() || ""
  if (ext === "markdown") return "md"
  if (ext === "htm") return "html"
  if (ext === "jpeg") return "jpg"
  if (ext === "xls") return "xlsx"
  return ext as Kind
}

function isImage(kind: Kind): boolean {
  return kind === "png" || kind === "jpg" || kind === "webp" || kind === "gif" || kind === "bmp" || kind === "svg" || kind === "ico"
}

async function asHtml(source: Kind, input: FileBytes): Promise<string> {
  if (source === "html") return text(input.data)
  if (source === "md") return markdownToHtml(text(input.data))
  if (source === "txt") return textToHtml(text(input.data))
  if (source === "rtf") return textToHtml(rtfToText(text(input.data)))
  if (source === "docx") return docxHtml(input.data)
  if (source === "csv" || source === "tsv" || source === "xlsx" || source === "ods") {
    return XLSX.utils.sheet_to_html(firstSheet(readSheet(input.data, source)))
  }
  if (source === "json") return XLSX.utils.sheet_to_html(firstSheet(jsonToBook(text(input.data))))
  throw new Error(`Cannot draw ${input.name} as a picture.`)
}

async function docxHtml(data: Uint8Array): Promise<string> {
  return (await mammoth.convertToHtml({ buffer: Buffer.from(data) })).value
}

function rtfToText(rtf: string): string {
  return rtf
    .replace(/\r\n/g, "\n")
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\line/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u(-?\d+)\??/g, (_, code: string) => {
      const value = Number(code)
      return String.fromCodePoint(value < 0 ? value + 65536 : value)
    })
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function tabularOutput(
  named: (kind: Kind, data: Uint8Array, suffix?: string) => Converted,
  target: Kind,
  book: XLSX.WorkBook,
  helpers: Partial<Helpers>,
): Promise<Converted[]> {
  const sheet = firstSheet(book)
  if (target === "json") return [named("json", bytes(JSON.stringify(XLSX.utils.sheet_to_json(sheet, { defval: "" }), null, 2)))]
  if (target === "xlsx") return [named("xlsx", writeBook(book))]
  if (target === "csv") return [named("csv", bytes(XLSX.utils.sheet_to_csv(sheet)))]
  if (target === "tsv") return [named("tsv", bytes(XLSX.utils.sheet_to_csv(sheet, { FS: "\t" })))]
  if (target === "md") return [named("md", bytes(sheetToMarkdown(sheet)))]
  if (target === "html") return [named("html", bytes(XLSX.utils.sheet_to_html(sheet)))]
  if (target === "txt") return [named("txt", bytes(XLSX.utils.sheet_to_csv(sheet, { FS: "\t" })))]
  if (target === "pdf") return [named("pdf", await need(helpers, "htmlToPdf")(XLSX.utils.sheet_to_html(sheet)))]
  throw new Error(`Cannot convert that table to ${target}.`)
}

function text(data: Uint8Array): string {
  return new TextDecoder().decode(data)
}

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

async function markdownToHtml(markdown: string): Promise<string> {
  return marked.parse(markdown, { async: false }) as string
}

function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim()
}

function textToHtml(value: string): string {
  const blocks = value.replace(/\r\n/g, "\n").split(/\n{2,}/)
  return blocks.map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`).join("")
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

async function htmlToDocx(html: string): Promise<Uint8Array> {
  const result = await HTMLtoDOCX(`<!doctype html><html><body>${html}</body></html>`)
  if (result instanceof Uint8Array) return result
  if (result instanceof ArrayBuffer) return new Uint8Array(result)
  const blob = result as Blob
  return new Uint8Array(await blob.arrayBuffer())
}

function readSheet(data: Uint8Array, kind: "csv" | "tsv" | "xlsx" | "ods"): XLSX.WorkBook {
  if (kind === "tsv") return XLSX.read(Buffer.from(data), { type: "buffer", FS: "\t", raw: false })
  return XLSX.read(Buffer.from(data), { type: "buffer", raw: false })
}

function htmlToBook(html: string): XLSX.WorkBook {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)]
  if (tables.length === 0) throw new Error("That file has no table to convert.")
  const book = XLSX.utils.book_new()
  tables.forEach((match, index) => {
    const rows = [...match[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((row) =>
      [...row[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => htmlToText(cell[1]).replace(/\s+/g, " ").trim()),
    )
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), `Table${index + 1}`)
  })
  return book
}

function markdownToBook(markdown: string): XLSX.WorkBook {
  const tables: string[][][] = []
  let current: string[][] | null = null
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|$/.test(trimmed)) continue
      if (!current) {
        current = []
        tables.push(current)
      }
      current.push(trimmed.slice(1, -1).split("|").map((cell) => cell.trim()))
      continue
    }
    current = null
  }
  if (tables.length === 0) throw new Error("That file has no table to convert.")
  const book = XLSX.utils.book_new()
  tables.forEach((rows, index) => XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), `Table${index + 1}`))
  return book
}

function writeBook(book: XLSX.WorkBook): Uint8Array {
  return new Uint8Array(XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer)
}

function firstSheet(book: XLSX.WorkBook): XLSX.WorkSheet {
  const name = book.SheetNames[0]
  if (!name) throw new Error("That spreadsheet has no sheets.")
  return book.Sheets[name]
}

function sheetToMarkdown(sheet: XLSX.WorkSheet): string {
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, { header: 1, raw: false, defval: "" })
  if (rows.length === 0) return ""
  const width = Math.max(...rows.map((row) => row.length))
  const cells = rows.map((row) =>
    Array.from({ length: width }, (_, index) => String(row[index] ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")),
  )
  const header = cells[0]
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...cells.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ].join("\n")
}

function jsonToBook(source: string): XLSX.WorkBook {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error("That JSON could not be read.")
  }
  const book = XLSX.utils.book_new()
  if (Array.isArray(value)) {
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(asRows(value)), "Sheet1")
    return book
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length > 0 && entries.every(([, entry]) => Array.isArray(entry))) {
      for (const [key, entry] of entries) {
        XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(asRows(entry as unknown[])), safeSheetName(key))
      }
      return book
    }
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([value as Record<string, unknown>]), "Sheet1")
    return book
  }
  throw new Error("JSON must be a list of rows or an object.")
}

function asRows(value: unknown[]): Record<string, unknown>[] {
  if (value.length === 0) return []
  if (value.every((item) => item && typeof item === "object" && !Array.isArray(item))) return value as Record<string, unknown>[]
  return value.map((item, index) => ({ index: index + 1, value: item }))
}

function safeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim() || "Sheet"
  return cleaned.slice(0, 31)
}

async function imagesToPdf(images: Uint8Array[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  for (const bytes of images) {
    const image = isPng(bytes) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
    const page = pdf.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }
  return pdf.save()
}

function isPng(data: Uint8Array): boolean {
  return data[0] === 0x89 && data[1] === 0x50
}

function need<K extends keyof Helpers>(helpers: Partial<Helpers>, key: K): NonNullable<Helpers[K]> {
  const helper = helpers[key]
  if (!helper) throw new Error("This conversion is not available in this run.")
  return helper
}
