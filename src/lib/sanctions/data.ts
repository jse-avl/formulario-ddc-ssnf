import fs from 'node:fs'
import path from 'node:path'

export type SdnEntry = {
  n: string
  t: string
  p: string
}

let entries: SdnEntry[] | null = null

export async function loadSdnList(): Promise<SdnEntry[]> {
  if (entries) return entries
  const filePath = path.join(process.cwd(), 'public', 'data', 'sdn.json')
  const text = fs.readFileSync(filePath, 'utf-8')
  entries = JSON.parse(text) as SdnEntry[]
  return entries
}

export function getSdnList(): SdnEntry[] {
  return entries || []
}
