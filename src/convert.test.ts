import assert from "node:assert/strict"
import test from "node:test"
import { convertFile } from "./convert.ts"
import { emailSubject, isEmailAddress } from "./email.ts"
import { kindOf, TARGETS } from "./kinds.ts"

const encoder = new TextEncoder()

test("recognises the file types this app converts", () => {
  assert.equal(kindOf("notes.md"), "md")
  assert.equal(kindOf("photo.JPEG"), "jpg")
  assert.equal(kindOf("book.xls"), "xlsx")
  assert.equal(kindOf("archive.zip"), null)
  assert.equal(kindOf("icon.ICO"), "ico")
  assert.equal(kindOf("sheet.ods"), "ods")
  assert.equal(kindOf("rows.tsv"), "tsv")
  assert.ok(TARGETS.pdf.includes("jpg"))
  assert.ok(TARGETS.pdf.includes("md"))
  assert.ok(TARGETS.gif.includes("png"))
  assert.ok(TARGETS.rtf.includes("docx"))
  assert.ok(TARGETS.png.includes("pdf"))
})

test("wires every advertised conversion", async () => {
  const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"))
  const helpers = {
    htmlToPdf: async () => new Uint8Array([37, 80, 68, 70]),
    htmlToImages: async () => [png],
    pdfToText: async () => "Hello",
    pdfToImages: async () => [png],
    transcodeImage: async () => png,
  }
  const html = encoder.encode("<p>Hello</p><table><tr><td>A</td></tr></table>")
  const docx = (await convertFile({ path: "page.html", name: "page.html", data: html }, "docx"))[0].data
  const xlsx = (await convertFile({ path: "rows.csv", name: "rows.csv", data: encoder.encode("a,b\n1,2\n") }, "xlsx"))[0].data
  const samples: Record<string, Uint8Array> = {
    md: encoder.encode("| a |\n| --- |\n| 1 |\n"),
    html,
    txt: encoder.encode("Hello"),
    docx,
    rtf: encoder.encode("{\\rtf1 Hello}"),
    pdf: new Uint8Array([37, 80, 68, 70]),
    csv: encoder.encode("a,b\n1,2\n"),
    tsv: encoder.encode("a\tb\n1\t2\n"),
    json: encoder.encode("[{\"a\":1}]"),
    xlsx,
    ods: xlsx,
    png,
    jpg: png,
    webp: png,
    gif: png,
    bmp: png,
    svg: encoder.encode("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"8\" height=\"8\"></svg>"),
    ico: png,
  }
  const missing: string[] = []
  for (const [source, targets] of Object.entries(TARGETS)) {
    for (const target of targets) {
      try {
        const outputs = await convertFile({ path: `file.${source}`, name: `file.${source}`, data: samples[source] }, target as never, helpers)
        assert.ok(outputs.length > 0)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.startsWith("Cannot convert")) missing.push(`${source}->${target}`)
        else throw error
      }
    }
  }
  assert.deepEqual(missing, [])
})

test("rejects JSON that is not a list or object", async () => {
  const input = { path: "note.json", name: "note.json", data: encoder.encode("not json") }
  await assert.rejects(() => convertFile(input, "csv"), /That JSON could not be read/)
})

test("checks an email address before opening mail", () => {
  assert.equal(isEmailAddress("ada@example.com"), true)
  assert.equal(isEmailAddress("not an email"), false)
  assert.equal(emailSubject(["report.pdf"]), "report.pdf")
  assert.equal(emailSubject(["a.pdf", "b.pdf"]), "2 files from DocShit")
})

test("converts markdown to html and plain text", async () => {
  const input = { path: "note.md", name: "note.md", data: encoder.encode("# Hello\n\nA [link](https://example.com).") }
  const html = await convertFile(input, "html")
  assert.match(new TextDecoder().decode(html[0].data), /<h1>Hello<\/h1>/)
  const text = await convertFile(input, "txt")
  assert.match(new TextDecoder().decode(text[0].data), /Hello/)
  assert.doesNotMatch(new TextDecoder().decode(text[0].data), /https:\/\/example.com/)
})

test("converts a csv into json and markdown", async () => {
  const input = { path: "people.csv", name: "people.csv", data: encoder.encode("name,city\nAda,London\n") }
  const json = JSON.parse(new TextDecoder().decode((await convertFile(input, "json"))[0].data)) as { name: string }[]
  assert.equal(json[0].name, "Ada")
  const markdown = new TextDecoder().decode((await convertFile(input, "md"))[0].data)
  assert.match(markdown, /\| name \| city \|/)
  assert.match(markdown, /Ada/)
})

test("converts a json list into csv", async () => {
  const input = {
    path: "rows.json",
    name: "rows.json",
    data: encoder.encode(JSON.stringify([{ name: "Ada", city: "London" }])),
  }
  const csv = new TextDecoder().decode((await convertFile(input, "csv"))[0].data)
  assert.match(csv, /name,city/)
  assert.match(csv, /Ada,London/)
})

test("converts a csv into html and a tsv into csv", async () => {
  const csv = { path: "people.csv", name: "people.csv", data: encoder.encode("name,city\nAda,London\n") }
  const html = new TextDecoder().decode((await convertFile(csv, "html"))[0].data)
  assert.match(html, /<table/i)
  assert.match(html, /Ada/)
  const tsv = { path: "people.tsv", name: "people.tsv", data: encoder.encode("name\tcity\nAda\tLondon\n") }
  const out = new TextDecoder().decode((await convertFile(tsv, "csv"))[0].data)
  assert.match(out, /Ada,London/)
})

test("pulls a table out of html and markdown", async () => {
  const html = {
    path: "page.html",
    name: "page.html",
    data: encoder.encode("<table><tr><th>name</th><th>city</th></tr><tr><td>Ada</td><td>London</td></tr></table>"),
  }
  const csv = new TextDecoder().decode((await convertFile(html, "csv"))[0].data)
  assert.match(csv, /Ada,London/)
  const markdown = {
    path: "note.md",
    name: "note.md",
    data: encoder.encode("| name | city |\n| --- | --- |\n| Ada | London |\n"),
  }
  const json = JSON.parse(new TextDecoder().decode((await convertFile(markdown, "json"))[0].data)) as { name: string }[]
  assert.equal(json[0].name, "Ada")
})

test("reads rich text into plain text", async () => {
  const rtf = {
    path: "note.rtf",
    name: "note.rtf",
    data: encoder.encode("{\\rtf1\\ansi Hello\\par From DocShit}"),
  }
  const text = new TextDecoder().decode((await convertFile(rtf, "txt"))[0].data)
  assert.match(text, /Hello/)
  assert.match(text, /From DocShit/)
})

test("turns json rows into a markdown table", async () => {
  const input = {
    path: "rows.json",
    name: "rows.json",
    data: encoder.encode(JSON.stringify([{ name: "Ada", city: "London" }])),
  }
  const markdown = new TextDecoder().decode((await convertFile(input, "md"))[0].data)
  assert.match(markdown, /\| name \| city \|/)
  assert.match(markdown, /Ada/)
})

test("round-trips html through a word document", async () => {
  const html = { path: "page.html", name: "page.html", data: encoder.encode("<h1>Hello</h1><p>From DocShit</p>") }
  const docx = await convertFile(html, "docx")
  assert.equal(docx[0].name, "page.docx")
  const text = await convertFile({ path: docx[0].name, name: docx[0].name, data: docx[0].data }, "txt")
  assert.match(new TextDecoder().decode(text[0].data), /Hello/)
  assert.match(new TextDecoder().decode(text[0].data), /From DocShit/)
})
