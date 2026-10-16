import { KIND_LABEL, type Kind } from "./kinds"

type ListedFile = {
  path: string
  name: string
  kind: Kind
  label: string
  targets: Kind[]
}

type ConvertResponse = {
  canceled: boolean
  outputs: { name: string; path: string }[]
  errors: { name: string; message: string }[]
}

type Tool = {
  title: string
  blurb: string
  from: Kind[]
  to: Kind
  badge: string
  color: string
  group: string
}

const TOOLS: Tool[] = [
  { title: "PDF to Word", blurb: "Turn a PDF into an editable Word document", from: ["pdf"], to: "docx", badge: "PDF", color: "#e11d48", group: "Popular" },
  { title: "Word to PDF", blurb: "Save a Word document as a PDF", from: ["docx"], to: "pdf", badge: "W", color: "#2563eb", group: "Popular" },
  { title: "PDF to PNG", blurb: "Export each PDF page as an image", from: ["pdf"], to: "png", badge: "PDF", color: "#e11d48", group: "Popular" },
  { title: "PDF to JPEG", blurb: "Export each PDF page as a JPEG", from: ["pdf"], to: "jpg", badge: "PDF", color: "#e11d48", group: "Popular" },
  { title: "Image to PDF", blurb: "Make a PDF from a PNG, JPEG, GIF, SVG, or other image", from: ["png", "jpg", "webp", "gif", "bmp", "svg", "ico"], to: "pdf", badge: "IMG", color: "#f59e0b", group: "Popular" },
  { title: "Excel to CSV", blurb: "Export the first sheet as a spreadsheet file", from: ["xlsx"], to: "csv", badge: "X", color: "#16a34a", group: "Popular" },
  { title: "Markdown to PDF", blurb: "Turn a Markdown note into a PDF", from: ["md"], to: "pdf", badge: "MD", color: "#7c3aed", group: "Popular" },
  { title: "PDF to text", blurb: "Pull the words out of a PDF", from: ["pdf"], to: "txt", badge: "PDF", color: "#e11d48", group: "Documents" },
  { title: "PDF to Markdown", blurb: "Pull the words out of a PDF as Markdown", from: ["pdf"], to: "md", badge: "PDF", color: "#e11d48", group: "Documents" },
  { title: "Word to PNG", blurb: "Save each Word page as an image", from: ["docx"], to: "png", badge: "W", color: "#2563eb", group: "Documents" },
  { title: "HTML to PNG", blurb: "Save an HTML file as an image", from: ["html"], to: "png", badge: "HTML", color: "#0d9488", group: "Documents" },
  { title: "Rich text to Word", blurb: "Turn an RTF file into a Word document", from: ["rtf"], to: "docx", badge: "RTF", color: "#2563eb", group: "Documents" },
  { title: "Word to Markdown", blurb: "Save a Word file as Markdown", from: ["docx"], to: "md", badge: "W", color: "#2563eb", group: "Documents" },
  { title: "Markdown to Word", blurb: "Turn Markdown into a Word document", from: ["md"], to: "docx", badge: "MD", color: "#7c3aed", group: "Documents" },
  { title: "HTML to PDF", blurb: "Print an HTML file to PDF", from: ["html"], to: "pdf", badge: "HTML", color: "#0d9488", group: "Documents" },
  { title: "HTML to Markdown", blurb: "Convert a web page file to Markdown", from: ["html"], to: "md", badge: "HTML", color: "#0d9488", group: "Documents" },
  { title: "Text to PDF", blurb: "Put plain text onto a PDF page", from: ["txt"], to: "pdf", badge: "TXT", color: "#475569", group: "Documents" },
  { title: "Excel to JSON", blurb: "Turn the first sheet into JSON", from: ["xlsx"], to: "json", badge: "X", color: "#16a34a", group: "Spreadsheets" },
  { title: "CSV to Excel", blurb: "Open a CSV as an Excel workbook", from: ["csv"], to: "xlsx", badge: "CSV", color: "#16a34a", group: "Spreadsheets" },
  { title: "CSV to JSON", blurb: "Turn spreadsheet rows into JSON", from: ["csv"], to: "json", badge: "CSV", color: "#16a34a", group: "Spreadsheets" },
  { title: "JSON to Excel", blurb: "Turn a list of rows into a workbook", from: ["json"], to: "xlsx", badge: "JSON", color: "#4f46e5", group: "Spreadsheets" },
  { title: "Excel to PDF", blurb: "Print the first sheet as a PDF", from: ["xlsx"], to: "pdf", badge: "X", color: "#16a34a", group: "Spreadsheets" },
  { title: "CSV to PDF", blurb: "Print a CSV as a PDF", from: ["csv"], to: "pdf", badge: "CSV", color: "#16a34a", group: "Spreadsheets" },
  { title: "TSV to Excel", blurb: "Open a tab-separated file as Excel", from: ["tsv"], to: "xlsx", badge: "TSV", color: "#16a34a", group: "Spreadsheets" },
  { title: "ODS to Excel", blurb: "Open an OpenDocument spreadsheet in Excel", from: ["ods"], to: "xlsx", badge: "ODS", color: "#16a34a", group: "Spreadsheets" },
  { title: "JSON to Markdown", blurb: "Turn rows into a Markdown table", from: ["json"], to: "md", badge: "JSON", color: "#4f46e5", group: "Spreadsheets" },
  { title: "PNG to JPEG", blurb: "Save a PNG as a JPEG", from: ["png"], to: "jpg", badge: "PNG", color: "#f59e0b", group: "Images" },
  { title: "JPEG to PNG", blurb: "Save a JPEG as a PNG", from: ["jpg"], to: "png", badge: "JPG", color: "#f59e0b", group: "Images" },
  { title: "PNG to WebP", blurb: "Save a PNG as a WebP", from: ["png"], to: "webp", badge: "PNG", color: "#f59e0b", group: "Images" },
  { title: "WebP to PNG", blurb: "Save a WebP as a PNG", from: ["webp"], to: "png", badge: "WebP", color: "#f59e0b", group: "Images" },
  { title: "JPEG to WebP", blurb: "Save a JPEG as a WebP", from: ["jpg"], to: "webp", badge: "JPG", color: "#f59e0b", group: "Images" },
  { title: "GIF to PNG", blurb: "Save the first GIF frame as a PNG", from: ["gif"], to: "png", badge: "GIF", color: "#f59e0b", group: "Images" },
  { title: "SVG to PNG", blurb: "Draw an SVG as a PNG", from: ["svg"], to: "png", badge: "SVG", color: "#f59e0b", group: "Images" },
  { title: "BMP to PNG", blurb: "Save a BMP as a PNG", from: ["bmp"], to: "png", badge: "BMP", color: "#f59e0b", group: "Images" },
]

const api = (
  window as unknown as {
    docshift?: {
      pathForFile: (file: File) => string
      inspect: (paths: string[]) => Promise<{ files: ListedFile[]; skipped: string[] }>
      pickFiles: () => Promise<{ canceled?: boolean; files: ListedFile[]; skipped: string[]; message?: string }>
      pickFolder: () => Promise<{ canceled?: boolean; files: ListedFile[]; skipped: string[]; message?: string }>
      convert: (files: { path: string; target: Kind }[], mode: "one" | "many") => Promise<ConvertResponse>
      reveal: (filePath: string) => Promise<void>
      email: (request: { to: string; note: string; paths: string[] }) => Promise<{ ok: boolean; attached: boolean; message: string }>
    }
  }
).docshift

const app = document.querySelector("#app") as HTMLElement
const brand = document.querySelector("#brand") as HTMLButtonElement

let tool: Tool | null = null
let files: ListedFile[] = []
let busy = false
let message = ""
let messageError = false
let emailTo = readEmail()
let emailNote = ""
let emailStatus = ""
let emailError = false
let emailBusy = false

brand.addEventListener("click", () => {
  tool = null
  files = []
  message = ""
  paint()
})

paint()

function paint() {
  app.replaceChildren()
  if (!tool) {
    paintHome()
    return
  }
  paintTool()
}

function paintHome() {
  const title = document.createElement("h1")
  title.append("Yo Shit face!", document.createElement("br"), "What do you want to convert?")
  const lede = document.createElement("p")
  lede.className = "lede"
  lede.textContent = "Drop any file, pick a format, then email it from your own mail app."
  app.append(title, lede, intakeField())
  if (message) {
    const note = document.createElement("p")
    note.className = messageError ? "note error" : "note"
    note.textContent = message
    app.append(note)
  }
  if (files.length > 0) app.append(choicePanel())
  const or = document.createElement("h2")
  or.className = "or-tools"
  or.textContent = "Or pick a tool"
  for (const group of ["Popular", "Documents", "Spreadsheets", "Images"]) {
    const section = document.createElement("section")
    section.className = "group"
    const heading = document.createElement("h2")
    heading.textContent = group
    const grid = document.createElement("div")
    grid.className = "grid"
    for (const item of TOOLS.filter((entry) => entry.group === group)) {
      const card = document.createElement("button")
      card.type = "button"
      card.className = "card"
      const badge = document.createElement("span")
      badge.className = "badge"
      badge.style.background = item.color
      badge.textContent = item.badge
      const copy = document.createElement("span")
      const name = document.createElement("strong")
      name.textContent = item.title
      const blurb = document.createElement("em")
      blurb.textContent = item.blurb
      copy.append(name, blurb)
      const chevron = document.createElement("span")
      chevron.className = "chevron"
      chevron.textContent = "›"
      card.append(badge, copy, chevron)
      card.addEventListener("click", () => openTool(item))
      grid.append(card)
    }
    section.append(heading, grid)
    app.append(section)
  }
  app.insertBefore(or, app.querySelector(".group"))
}

function intakeField() {
  const drop = document.createElement("section")
  drop.className = "intake"
  const mark = document.createElement("div")
  mark.className = "intake-mark"
  mark.setAttribute("aria-hidden", "true")
  const copy = document.createElement("div")
  const name = document.createElement("strong")
  name.textContent = files.length > 0 ? "Add another file" : "Drop any file"
  const detail = document.createElement("span")
  detail.textContent = "PDF, Word, Excel, GIF, SVG, RTF, and more"
  copy.append(name, detail)
  const actions = document.createElement("div")
  actions.className = "intake-actions"
  const folder = document.createElement("button")
  folder.type = "button"
  folder.className = "folder-link"
  folder.textContent = "Folder"
  folder.disabled = busy
  folder.addEventListener("click", () => void addAnyFolder())
  const choose = document.createElement("button")
  choose.type = "button"
  choose.className = "pick"
  choose.textContent = busy ? "CONVERTING…" : "Choose files"
  choose.disabled = busy
  choose.addEventListener("click", () => void addAnyFromPicker())
  actions.append(folder, choose)
  drop.append(mark, copy, actions)
  watchDrop(drop, (paths) => void addAnyPaths(paths))
  return drop
}

function choicePanel() {
  const panel = document.createElement("section")
  panel.className = "choices"
  const list = document.createElement("ul")
  list.className = "files"
  for (const file of files) {
    const item = document.createElement("li")
    item.className = "file"
    const copy = document.createElement("div")
    const name = document.createElement("strong")
    name.textContent = file.name
    const meta = document.createElement("span")
    meta.textContent = file.label
    copy.append(name, meta)
    const remove = document.createElement("button")
    remove.type = "button"
    remove.className = "remove"
    remove.textContent = "Remove"
    remove.addEventListener("click", () => {
      files = files.filter((entry) => entry.path !== file.path)
      message = ""
      paint()
    })
    item.append(copy, remove)
    list.append(item)
  }
  const options = sharedTargets(files)
  const label = document.createElement("p")
  label.className = options.length > 0 ? "options-label" : "note"
  label.textContent = options.length > 0 ? "Convert to" : "These files convert to different formats. Remove one to see options."
  panel.append(list, label)
  if (options.length > 0) {
    const row = document.createElement("div")
    row.className = "options"
    for (const target of options) {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "option"
      button.textContent = KIND_LABEL[target]
      button.disabled = busy
      button.addEventListener("click", () => void runConvertTo(target))
      row.append(button)
    }
    panel.append(row)
  }
  return panel
}

function sharedTargets(list: ListedFile[]): Kind[] {
  const [first, ...rest] = list
  if (!first) return []
  return first.targets.filter((target) => rest.every((file) => file.targets.includes(target)))
}

function openTool(next: Tool) {
  tool = next
  files = []
  message = ""
  messageError = false
  busy = false
  paint()
}

function paintTool() {
  if (!tool) return
  const current = tool
  const back = document.createElement("button")
  back.type = "button"
  back.className = "back"
  back.textContent = "‹ All tools"
  back.addEventListener("click", () => openHome())
  const title = document.createElement("h1")
  title.className = "tool-title"
  title.textContent = current.title
  const drop = document.createElement("section")
  drop.className = "drop"
  const mark = document.createElement("div")
  mark.className = "drop-mark"
  mark.setAttribute("aria-hidden", "true")
  const choose = document.createElement("button")
  choose.type = "button"
  choose.className = "choose"
  choose.textContent = busy ? "CONVERTING…" : "CHOOSE FILES"
  choose.disabled = busy
  choose.addEventListener("click", () => void addFromPicker())
  const or = document.createElement("p")
  or.textContent = busy ? "Working on this computer" : "or drop files here"
  drop.append(mark, choose, or)
  watchDrop(drop, (paths) => void addPaths(paths))
  const hint = document.createElement("p")
  hint.className = "hint"
  hint.textContent = `Accepts ${current.from.map((kind) => KIND_LABEL[kind]).join(", ")}. Add one file or several.`
  const folder = document.createElement("button")
  folder.type = "button"
  folder.className = "folder-link"
  folder.textContent = "Choose a folder instead"
  folder.addEventListener("click", () => void addFolder())
  app.append(back, title, drop, hint, folder)
  if (message) {
    const note = document.createElement("p")
    note.className = messageError ? "note error" : "note"
    note.textContent = message
    app.append(note)
  }
  if (files.length > 0) {
    const list = document.createElement("ul")
    list.className = "files"
    for (const file of files) {
      const item = document.createElement("li")
      item.className = "file"
      const copy = document.createElement("div")
      const name = document.createElement("strong")
      name.textContent = file.name
      const meta = document.createElement("span")
      meta.textContent = `${file.label} → ${KIND_LABEL[current.to]}`
      copy.append(name, meta)
      const remove = document.createElement("button")
      remove.type = "button"
      remove.className = "remove"
      remove.textContent = "Remove"
      remove.addEventListener("click", () => {
        files = files.filter((entry) => entry.path !== file.path)
        paint()
      })
      item.append(copy, remove)
      list.append(item)
    }
    const go = document.createElement("button")
    go.type = "button"
    go.className = "go"
    go.disabled = busy
    go.textContent = busy ? "Converting…" : `Convert to ${KIND_LABEL[current.to]}`
    go.addEventListener("click", () => void runConvert())
    app.append(list, go)
  }
}

function watchDrop(drop: HTMLElement, accept: (paths: string[]) => void) {
  let depth = 0
  drop.addEventListener("dragenter", (event) => {
    event.preventDefault()
    depth += 1
    drop.classList.add("over")
  })
  drop.addEventListener("dragover", (event) => event.preventDefault())
  drop.addEventListener("dragleave", () => {
    depth -= 1
    if (depth <= 0) {
      depth = 0
      drop.classList.remove("over")
    }
  })
  drop.addEventListener("drop", (event) => {
    event.preventDefault()
    depth = 0
    drop.classList.remove("over")
    if (!api || busy) return
    const paths = [...(event.dataTransfer?.files || [])].map((file) => api.pathForFile(file)).filter(Boolean)
    accept(paths)
  })
}

function openHome() {
  tool = null
  files = []
  message = ""
  paint()
}

async function addFromPicker() {
  if (!api || !tool || busy) return
  const picked = await api.pickFiles()
  if (picked.canceled) return
  const matched = picked.files.filter((file) => tool?.from.includes(file.kind))
  if (matched.length === 0) {
    message = `Choose a ${tool.from.map((kind) => KIND_LABEL[kind]).join(" or ")} file.`
    messageError = true
    paint()
    return
  }
  merge(matched)
}

async function addFolder() {
  if (!api || !tool || busy) return
  message = "Reading the folder…"
  messageError = false
  paint()
  try {
    const picked = await api.pickFolder()
    if (picked.canceled) {
      message = ""
      paint()
      return
    }
    if (picked.message) {
      message = picked.message
      messageError = true
      paint()
      return
    }
    const found = picked.files.filter((file) => tool?.from.includes(file.kind))
    if (found.length === 0) {
      message = "That folder has no files this tool can convert."
      messageError = true
      paint()
      return
    }
    merge(found)
  } catch (error) {
    message = error instanceof Error ? error.message : "That folder could not be read."
    messageError = true
    paint()
  }
}

async function addPaths(paths: string[]) {
  if (!api || !tool) return
  const inspected = (await api.inspect(paths)).files.filter((file) => tool?.from.includes(file.kind))
  if (inspected.length === 0) {
    message = `This tool needs a ${tool.from.map((kind) => KIND_LABEL[kind]).join(" or ")} file.`
    messageError = true
    paint()
    return
  }
  merge(inspected)
}

async function addAnyFromPicker() {
  if (!api || busy) return
  const picked = await api.pickFiles()
  if (picked.canceled) return
  acceptAny(picked.files, picked.skipped)
}

async function addAnyFolder() {
  if (!api || busy) return
  message = "Reading the folder…"
  messageError = false
  paint()
  try {
    const picked = await api.pickFolder()
    if (picked.canceled) {
      message = ""
      paint()
      return
    }
    if (picked.message) {
      message = picked.message
      messageError = true
      paint()
      return
    }
    if (picked.files.length === 0) {
      message = "That folder has no files DocShit can convert."
      messageError = true
      paint()
      return
    }
    merge(picked.files)
  } catch (error) {
    message = error instanceof Error ? error.message : "That folder could not be read."
    messageError = true
    paint()
  }
}

async function addAnyPaths(paths: string[]) {
  if (!api) return
  const { files: inspected, skipped } = await api.inspect(paths)
  acceptAny(inspected, skipped)
}

function acceptAny(next: ListedFile[], skipped: string[]) {
  if (next.length === 0) {
    message = skipped.length > 0 ? `Can't convert ${skipped.join(", ")}.` : "Choose a document or image."
    messageError = true
    paint()
    return
  }
  merge(next, skipped.length > 0 ? `Skipped ${skipped.join(", ")}.` : "")
}

async function runConvertTo(target: Kind) {
  if (!api || files.length === 0 || busy) return
  busy = true
  message = ""
  paint()
  const jobs = files.map((file) => ({ path: file.path, target }))
  let result: ConvertResponse
  try {
    result = await api.convert(jobs, files.length === 1 ? "one" : "many")
  } catch (error) {
    busy = false
    message = error instanceof Error ? error.message : "Could not convert that file."
    messageError = true
    paint()
    return
  }
  busy = false
  if (result.canceled) {
    message = "Cancelled."
    messageError = false
    paint()
    return
  }
  if (result.outputs.length === 0) {
    message = result.errors.map((error) => `${error.name}: ${error.message}`).join(" ") || "Nothing was written."
    messageError = true
    paint()
    return
  }
  showDone(result)
}

function merge(next: ListedFile[], note = "") {
  const seen = new Set(files.map((file) => file.path))
  files = [...files, ...next.filter((file) => !seen.has(file.path))]
  message = note
  messageError = Boolean(note)
  paint()
}

async function runConvert() {
  if (!api || !tool || files.length === 0 || busy) return
  const current = tool
  busy = true
  message = ""
  paint()
  const jobs = files.map((file) => ({ path: file.path, target: current.to }))
  let result: ConvertResponse
  try {
    result = await api.convert(jobs, files.length === 1 ? "one" : "many")
  } catch (error) {
    busy = false
    message = error instanceof Error ? error.message : "Could not convert that file."
    messageError = true
    paint()
    return
  }
  busy = false
  if (result.canceled) {
    message = "Cancelled."
    messageError = false
    paint()
    return
  }
  if (result.outputs.length === 0) {
    message = result.errors.map((error) => `${error.name}: ${error.message}`).join(" ") || "Nothing was written."
    messageError = true
    paint()
    return
  }
  showDone(result)
}

function showDone(result: ConvertResponse) {
  emailStatus = ""
  emailError = false
  emailBusy = false
  paintDone(result)
}

function paintDone(result: ConvertResponse) {
  app.replaceChildren()
  const panel = document.createElement("section")
  panel.className = "done"
  const check = document.createElement("div")
  check.className = "check"
  check.textContent = "✓"
  const title = document.createElement("h1")
  title.textContent = result.outputs.length === 1 ? "Your file is ready" : "Your files are ready"
  const copy = document.createElement("p")
  copy.className = "hint"
  copy.textContent = "Saved on this computer. Click a name to show it in Finder or File Explorer."
  const shows = document.createElement("div")
  shows.className = "shows"
  for (const output of result.outputs.slice(0, 12)) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "show"
    button.textContent = output.name
    button.addEventListener("click", () => void api?.reveal(output.path))
    shows.append(button)
  }
  const again = document.createElement("button")
  again.type = "button"
  again.className = "again"
  again.textContent = "Convert another file"
  again.addEventListener("click", () => openHome())
  panel.append(check, title, copy, shows, mailCard(result), again)
  if (result.errors.length > 0) {
    const note = document.createElement("p")
    note.className = "note error"
    note.textContent = result.errors.map((error) => `${error.name}: ${error.message}`).join(" ")
    panel.append(note)
  }
  app.append(panel)
}

function mailCard(result: ConvertResponse) {
  const card = document.createElement("form")
  card.className = "mail"
  card.addEventListener("submit", (event) => {
    event.preventDefault()
    void emailOutputs(result)
  })
  const heading = document.createElement("h2")
  heading.textContent = "Email it"
  const help = document.createElement("p")
  help.textContent = "Opens your mail app with the file attached. You send it from there."
  const address = document.createElement("input")
  address.type = "email"
  address.required = true
  address.placeholder = "name@email.com"
  address.autocomplete = "email"
  address.value = emailTo
  address.addEventListener("input", () => {
    emailTo = address.value
  })
  const note = document.createElement("textarea")
  note.placeholder = "Add a note"
  note.value = emailNote
  note.addEventListener("input", () => {
    emailNote = note.value
  })
  const send = document.createElement("button")
  send.type = "submit"
  send.className = "send"
  send.disabled = emailBusy
  send.textContent = emailBusy ? "Opening mail…" : "Open in mail"
  card.append(heading, help, address, note, send)
  if (emailStatus) {
    const status = document.createElement("p")
    status.className = emailError ? "note error" : "mail-status"
    status.textContent = emailStatus
    card.append(status)
  }
  return card
}

async function emailOutputs(result: ConvertResponse) {
  emailTo = emailTo.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
    emailStatus = "Enter an email address."
    emailError = true
    paintDone(result)
    return
  }
  if (!api) {
    emailStatus = "Email opens from the DocShit app."
    emailError = true
    paintDone(result)
    return
  }
  emailBusy = true
  emailStatus = ""
  paintDone(result)
  let response: { ok: boolean; attached: boolean; message: string }
  try {
    response = await api.email({
      to: emailTo,
      note: emailNote,
      paths: result.outputs.map((output) => output.path),
    })
  } catch (error) {
    emailBusy = false
    emailError = true
    emailStatus = error instanceof Error ? error.message : "Could not open your mail app."
    paintDone(result)
    return
  }
  try {
    localStorage.setItem("docshit-email", emailTo)
  } catch {
    // The address still stays for this session.
  }
  emailBusy = false
  emailError = !response.ok
  emailStatus = response.message
  paintDone(result)
}

function readEmail(): string {
  try {
    return localStorage.getItem("docshit-email") || ""
  } catch {
    return ""
  }
}
