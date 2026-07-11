import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SDN_CSV_URL = 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV'
const ALT_CSV_URL = 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/ALT.CSV'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'sdn.json')

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.replace(/""/g, '"').trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.replace(/""/g, '"').trim())
  return result
}

async function downloadCSV(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DDC-SSNF/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

async function main() {
  console.log('Descargando listas OFAC...')
  const [sdnText, altText] = await Promise.all([
    downloadCSV(SDN_CSV_URL),
    downloadCSV(ALT_CSV_URL),
  ])
  console.log(`SDN: ${(sdnText.length / 1024 / 1024).toFixed(1)} MB`)
  console.log(`ALT: ${(altText.length / 1024 / 1024).toFixed(1)} MB`)

  const sdnLines = sdnText.split(/\r?\n/).filter(Boolean)
  const altLines = altText.split(/\r?\n/).filter(Boolean)

  // SDN CSV columns (no header): ent_num, sdn_name, sdn_type, program, title, ...
  // ALT CSV columns (no header): ent_num, alt_name, alt_type, ...
  const nameMap = new Map()

  for (let i = 0; i < sdnLines.length; i++) {
    const cols = parseCSVLine(sdnLines[i])
    const name = cols[1]
    if (!name || name === '-0-') continue

    const entNum = cols[0]
    const sdnType = cols[2] && cols[2] !== '-0-' ? cols[2].toLowerCase() : ''
    const program = cols[3] && cols[3] !== '-0-' ? cols[3].toUpperCase() : ''

    const typeCode = sdnType === 'individual' ? 'I'
      : sdnType === 'entity' ? 'E'
      : sdnType === 'vessel' ? 'V'
      : sdnType === 'aircraft' ? 'A'
      : ''

    nameMap.set(entNum, {
      n: name.toUpperCase(),
      t: typeCode,
      p: program,
    })
  }

  // Add alternate names from ALT.CSV
  for (let i = 0; i < altLines.length; i++) {
    const cols = parseCSVLine(altLines[i])
    const entNum = cols[0]
    const altName = cols[1]
    if (!altName || altName === '-0-' || !entNum) continue
    const existing = nameMap.get(entNum)
    if (existing) {
      nameMap.set(entNum + '_ALT_' + i, {
        n: altName.toUpperCase(),
        t: existing.t,
        p: existing.p,
      })
    }
  }

  const entries = Array.from(nameMap.values())
    .filter(e => e.n.length > 2)
    .map(e => ({ n: e.n, t: e.t || 'U', p: e.p }))

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(entries))
  console.log(`✓ ${entries.length} entradas guardadas`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
