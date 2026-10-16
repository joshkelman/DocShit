import { execFile } from "node:child_process"
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron"
import fs from "node:fs/promises"
import path from "node:path"
import { convertFile } from "./convert"
import { cleanNote, emailSubject, isEmailAddress, type EmailResult } from "./email"
import { KIND_LABEL, TARGETS, kindOf, type Kind } from "./kinds"

type ListedFile = {
  path: string
  name: string
  kind: Kind
  label: string
  targets: Kind[]
}

let renderWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null
let pageWarning = ""

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) app.quit()

app.on("second-instance", () => {
  if (app.isReady()) showMain()
})

app.whenReady().then(() => {
  if (process.platform === "darwin" && !app.isPackaged) app.dock.setIcon(path.join(__dirname, "icon.png"))
  createWindow()
  app.on("activate", () => showMain())
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

function showMain() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1080,
    height: 820,
    minWidth: 860,
    minHeight: 640,
    title: "DocShit",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#f3efe6",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow = window
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null
  })
  void window.loadFile(path.join(__dirname, "index.html"))
}

function renderHost(): BrowserWindow {
  if (renderWindow && !renderWindow.isDestroyed()) return renderWindow
  renderWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      webSecurity: false,
    },
  })
  return renderWindow
}

async function withRender<T>(run: (window: BrowserWindow) => Promise<T>): Promise<T> {
  const window = renderHost()
  await window.loadFile(path.join(__dirname, "render.html"))
  return run(window)
}

ipcMain.handle("pick-files", async () => {
  const chosen = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "All files", extensions: ["*"] },
      {
        name: "Documents and images",
        extensions: ["md", "markdown", "html", "htm", "txt", "docx", "rtf", "pdf", "csv", "tsv", "json", "xlsx", "xls", "ods", "png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "ico"],
      },
    ],
  })
  if (chosen.canceled) return { canceled: true, files: [], skipped: [] }
  return splitPaths(chosen.filePaths)
})

ipcMain.handle("pick-folder", async () => {
  const chosen = await dialog.showOpenDialog({ properties: ["openDirectory"] })
  if (chosen.canceled || !chosen.filePaths[0]) return { canceled: true, files: [], skipped: [] }
  try {
    return { files: await scanFolder(chosen.filePaths[0]), skipped: [] }
  } catch {
    return { files: [], skipped: [], message: "That folder could not be read." }
  }
})

ipcMain.handle("inspect", async (_event, paths: string[]) => splitPaths(Array.isArray(paths) ? paths : []))

ipcMain.handle("convert", async (event, request: { files: { path: string; target: Kind }[]; mode: "one" | "many" }) => {
  const parent = BrowserWindow.fromWebContents(event.sender)
  const outputs: { name: string; path: string }[] = []
  const errors: { name: string; message: string }[] = []
  let outputDir = ""

  if (request.mode === "many") {
    const chosen = parent
      ? await dialog.showOpenDialog(parent, { properties: ["openDirectory", "createDirectory"], buttonLabel: "Save conversions here" })
      : await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] })
    if (chosen.canceled || !chosen.filePaths[0]) return { canceled: true, outputs, errors }
    outputDir = chosen.filePaths[0]
  }

  for (const file of request.files) {
    const name = path.basename(file.path)
    try {
      pageWarning = ""
      const data = new Uint8Array(await fs.readFile(file.path))
      const converted = await convertFile({ path: file.path, name, data }, file.target, {
        htmlToPdf,
        htmlToImages,
        pdfToText,
        pdfToImages,
        transcodeImage,
      })
      if (request.mode === "one" && converted.length === 1) {
        const save = parent
          ? await dialog.showSaveDialog(parent, { defaultPath: converted[0].name })
          : await dialog.showSaveDialog({ defaultPath: converted[0].name })
        if (save.canceled || !save.filePath) return { canceled: true, outputs, errors }
        await fs.writeFile(save.filePath, converted[0].data)
        outputs.push({ name: path.basename(save.filePath), path: save.filePath })
        continue
      }
      if (request.mode === "one") {
        const chosen = parent
          ? await dialog.showOpenDialog(parent, {
              properties: ["openDirectory", "createDirectory"],
              buttonLabel: "Save pages here",
            })
          : await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] })
        if (chosen.canceled || !chosen.filePaths[0]) return { canceled: true, outputs, errors }
        outputDir = chosen.filePaths[0]
      }
      for (const item of converted) {
        const saved = await writeUnique(outputDir, item.name, item.data)
        outputs.push({ name: path.basename(saved), path: saved })
      }
      if (pageWarning) errors.push({ name, message: pageWarning })
    } catch (error) {
      errors.push({ name, message: error instanceof Error ? error.message : "Could not convert that file." })
    }
  }

  return { canceled: false, outputs, errors }
})

ipcMain.handle("reveal", async (_event, filePath: string) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle("email", async (_event, request: { to?: string; note?: string; paths?: string[] }): Promise<EmailResult> => {
  const to = request.to?.trim() || ""
  if (!isEmailAddress(to)) return { ok: false, attached: false, message: "Enter an email address." }
  const paths = [...new Set(request.paths || [])].slice(0, 12)
  const files: string[] = []
  for (const filePath of paths) {
    try {
      const info = await fs.stat(filePath)
      if (info.isFile()) files.push(filePath)
    } catch {
      continue
    }
  }
  if (files.length === 0) return { ok: false, attached: false, message: "Save a converted file before emailing it." }
  const subject = emailSubject(files.map((filePath) => path.basename(filePath)))
  const note = cleanNote(request.note || "")
  try {
    if (process.platform === "darwin") await composeMacMail(to, subject, note || "\n", files)
    else if (process.platform === "win32") await composeOutlook(to, subject, note, files)
    else throw new Error("No mail app")
    return { ok: true, attached: true, message: "Your mail app is open with the file attached. Send it from there." }
  } catch {
    const body = note || "The converted file is ready to attach."
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    await shell.openExternal(mailto)
    shell.showItemInFolder(files[0])
    return {
      ok: true,
      attached: false,
      message: "Your email app is open. Drag the file from the folder that just appeared onto the message, then send it.",
    }
  }
})

async function splitPaths(paths: string[]): Promise<{ files: ListedFile[]; skipped: string[] }> {
  const files: ListedFile[] = []
  const skipped: string[] = []
  for (const filePath of paths) {
    const name = path.basename(filePath)
    const kind = kindOf(name)
    if (!kind) {
      skipped.push(name)
      continue
    }
    files.push({ path: filePath, name, kind, label: KIND_LABEL[kind], targets: TARGETS[kind] })
  }
  return { files, skipped }
}

async function scanFolder(folder: string): Promise<ListedFile[]> {
  const found: string[] = []
  await walk(folder, found, 0)
  return (await splitPaths(found.slice(0, 200))).files
}

async function walk(folder: string, found: string[], depth: number) {
  if (depth > 5 || found.length >= 200) return
  let entries
  try {
    entries = await fs.readdir(folder, { withFileTypes: true })
  } catch (error) {
    if (depth === 0) throw error
    return
  }
  for (const entry of entries) {
    if (found.length >= 200) return
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue
    const full = path.join(folder, entry.name)
    if (entry.isDirectory()) await walk(full, found, depth + 1)
    else if (kindOf(entry.name)) found.push(full)
  }
}

async function writeUnique(folder: string, name: string, data: Uint8Array): Promise<string> {
  const ext = path.extname(name)
  const base = path.basename(name, ext)
  let candidate = path.join(folder, name)
  let count = 2
  while (await exists(candidate)) {
    candidate = path.join(folder, `${base}-${count}${ext}`)
    count += 1
  }
  await fs.writeFile(candidate, data)
  return candidate
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function htmlToPdf(html: string): Promise<Uint8Array> {
  const window = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true },
  })
  const file = path.join(app.getPath("temp"), `docshift-${Date.now()}-${Math.random().toString(16).slice(2)}.html`)
  try {
    await fs.writeFile(file, `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`)
    await window.loadFile(file)
    return await window.webContents.printToPDF({ printBackground: true, pageSize: "A4" })
  } finally {
    await fs.rm(file, { force: true })
    window.destroy()
  }
}

async function pdfToText(filePath: string): Promise<string> {
  return withRender(async (window) => {
    const text = (await window.webContents.executeJavaScript(
      `window.docshiftPdfText(${JSON.stringify(filePath)})`,
    )) as string
    return text
  })
}

async function pdfToImages(filePath: string, format: "png" | "jpg"): Promise<Uint8Array[]> {
  return withRender(async (window) => {
    const result = (await window.webContents.executeJavaScript(
      `window.docshiftPdfPages(${JSON.stringify(filePath)}, ${JSON.stringify(format)})`,
    )) as { pages: string[]; truncated?: boolean }
    if (result.truncated) pageWarning = "Only the first 40 pages were saved."
    return result.pages.map((page) => Buffer.from(page, "base64"))
  })
}

async function htmlToImages(html: string, format: "png" | "jpg"): Promise<Uint8Array[]> {
  const pdf = await htmlToPdf(html)
  const file = path.join(app.getPath("temp"), `docshift-${Date.now()}.pdf`)
  await fs.writeFile(file, pdf)
  try {
    return await pdfToImages(file, format)
  } finally {
    await fs.rm(file, { force: true })
  }
}

const MAIL_SCRIPT = `on run argv
  set recipientAddr to item 1 of argv
  set subjectText to item 2 of argv
  set bodyText to item 3 of argv
  tell application "Mail"
    set theMessage to make new outgoing message with properties {subject:subjectText, content:bodyText, visible:true}
    tell theMessage
      make new to recipient at end of to recipients with properties {address:recipientAddr}
    end tell
    repeat with fileIndex from 4 to (count of argv)
      set theFile to POSIX file (item fileIndex of argv)
      tell theMessage
        make new attachment with properties {file name:theFile} at after the last paragraph
      end tell
    end repeat
    activate
  end tell
end run`

async function composeMacMail(to: string, subject: string, note: string, files: string[]): Promise<void> {
  await run("osascript", ["-e", MAIL_SCRIPT, "--", to, subject, note, ...files])
}

async function composeOutlook(to: string, subject: string, note: string, files: string[]): Promise<void> {
  const folder = app.getPath("temp")
  const payloadPath = path.join(folder, `docshit-mail-${Date.now()}.json`)
  const scriptPath = path.join(folder, "docshit-mail.ps1")
  const script = `$payload = Get-Content -Raw -Path $args[0] | ConvertFrom-Json
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = $payload.to
$mail.Subject = $payload.subject
$mail.Body = $payload.note
foreach ($file in $payload.paths) { [void]$mail.Attachments.Add($file) }
$mail.Display()`
  await fs.writeFile(scriptPath, script)
  await fs.writeFile(payloadPath, JSON.stringify({ to, subject, note, paths: files }))
  try {
    await run("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, payloadPath])
  } finally {
    await fs.rm(payloadPath, { force: true })
  }
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: 60000 }, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

async function transcodeImage(filePath: string, target: "png" | "jpg" | "webp"): Promise<Uint8Array> {
  return withRender(async (window) => {
    const encoded = (await window.webContents.executeJavaScript(
      `window.docshiftTranscode(${JSON.stringify(filePath)}, ${JSON.stringify(target)})`,
    )) as string
    return Buffer.from(encoded, "base64")
  })
}
