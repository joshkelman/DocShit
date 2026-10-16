import { contextBridge, ipcRenderer, webUtils } from "electron"
import type { EmailResult } from "./email"
import type { Kind } from "./kinds"

export type ListedFile = {
  path: string
  name: string
  kind: Kind
  label: string
  targets: Kind[]
}

export type ConvertResponse = {
  canceled: boolean
  outputs: { name: string; path: string }[]
  errors: { name: string; message: string }[]
}

export type FileList = {
  canceled?: boolean
  files: ListedFile[]
  skipped: string[]
  message?: string
}

const api = {
  pathForFile: (file: File) => webUtils.getPathForFile(file),
  inspect: (paths: string[]) => ipcRenderer.invoke("inspect", paths) as Promise<FileList>,
  pickFiles: () => ipcRenderer.invoke("pick-files") as Promise<FileList>,
  pickFolder: () => ipcRenderer.invoke("pick-folder") as Promise<FileList>,
  convert: (files: { path: string; target: Kind }[], mode: "one" | "many") =>
    ipcRenderer.invoke("convert", { files, mode }) as Promise<ConvertResponse>,
  reveal: (filePath: string) => ipcRenderer.invoke("reveal", filePath) as Promise<void>,
  email: (request: { to: string; note: string; paths: string[] }) =>
    ipcRenderer.invoke("email", request) as Promise<EmailResult>,
}

contextBridge.exposeInMainWorld("docshift", api)

export type DocshiftApi = typeof api
