export type Kind =
  | "md"
  | "html"
  | "txt"
  | "docx"
  | "rtf"
  | "pdf"
  | "csv"
  | "tsv"
  | "json"
  | "xlsx"
  | "ods"
  | "png"
  | "jpg"
  | "webp"
  | "gif"
  | "bmp"
  | "svg"
  | "ico"

export const KIND_LABEL: Record<Kind, string> = {
  md: "Markdown",
  html: "HTML",
  txt: "Plain text",
  docx: "Word",
  rtf: "Rich text",
  pdf: "PDF",
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  xlsx: "Excel",
  ods: "ODS",
  png: "PNG",
  jpg: "JPEG",
  webp: "WebP",
  gif: "GIF",
  bmp: "BMP",
  svg: "SVG",
  ico: "Icon",
}

const EXTENSIONS: Record<string, Kind> = {
  md: "md",
  markdown: "md",
  html: "html",
  htm: "html",
  txt: "txt",
  docx: "docx",
  rtf: "rtf",
  pdf: "pdf",
  csv: "csv",
  tsv: "tsv",
  json: "json",
  xlsx: "xlsx",
  xls: "xlsx",
  ods: "ods",
  png: "png",
  jpg: "jpg",
  jpeg: "jpg",
  webp: "webp",
  gif: "gif",
  bmp: "bmp",
  svg: "svg",
  ico: "ico",
}

export const TARGETS: Record<Kind, Kind[]> = {
  md: ["pdf", "docx", "html", "txt", "png", "jpg", "csv", "xlsx", "json", "tsv"],
  html: ["pdf", "docx", "md", "txt", "png", "jpg", "csv", "xlsx", "json", "tsv"],
  txt: ["pdf", "docx", "html", "md", "png", "jpg"],
  docx: ["pdf", "md", "html", "txt", "png", "jpg"],
  rtf: ["pdf", "docx", "md", "html", "txt"],
  pdf: ["docx", "txt", "md", "html", "png", "jpg"],
  csv: ["xlsx", "json", "pdf", "html", "md", "txt", "tsv", "png", "jpg"],
  tsv: ["xlsx", "csv", "json", "pdf", "html", "md", "txt", "png", "jpg"],
  json: ["xlsx", "csv", "pdf", "html", "md", "txt", "tsv", "png", "jpg"],
  xlsx: ["csv", "json", "pdf", "html", "md", "txt", "tsv", "png", "jpg"],
  ods: ["xlsx", "csv", "json", "pdf", "html", "md", "txt", "tsv", "png", "jpg"],
  png: ["jpg", "webp", "pdf"],
  jpg: ["png", "webp", "pdf"],
  webp: ["png", "jpg", "pdf"],
  gif: ["png", "jpg", "webp", "pdf"],
  bmp: ["png", "jpg", "webp", "pdf"],
  svg: ["png", "jpg", "webp", "pdf"],
  ico: ["png", "jpg", "webp", "pdf"],
}

export function kindOf(filename: string): Kind | null {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  return EXTENSIONS[ext] || null
}

export function extensionFor(kind: Kind): string {
  if (kind === "jpg") return "jpg"
  return kind
}
