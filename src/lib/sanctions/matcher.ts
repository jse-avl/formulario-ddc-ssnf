export type MatchResult = {
  score: number
  match: boolean
  matchedName: string
  type: string
  program: string
}

function normalize(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) {
    dp[i] = [i]
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1)
    }
  }
  return dp[m][n]
}

type SdnEntry = {
  n: string
  t: string
  p: string
}

function tokenize(s: string): string[] {
  return s.split(/\s+/).filter((w) => w.length > 1)
}

function tokenMatchRatio(aTokens: string[], bTokens: string[]): number {
  if (aTokens.length === 0 || bTokens.length === 0) return 0
  const setA = new Set(aTokens)
  const setB = new Set(bTokens)
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

function buildResult(entry: SdnEntry, score: number): MatchResult {
  return {
    score,
    match: score >= 70,
    matchedName: entry.n,
    type: entry.t,
    program: entry.p,
  }
}

function tryExactMatch(normalized: string, entry: SdnEntry): MatchResult | null {
  if (normalized !== normalize(entry.n)) return null
  return { score: 100, match: true, matchedName: entry.n, type: entry.t, program: entry.p }
}

function trySubstringMatch(normalized: string, entry: SdnEntry): MatchResult | null {
  const entryNormalized = normalize(entry.n)
  const isEntryInQuery = entryNormalized.includes(normalized)
  const isQueryInEntry = normalized.includes(entryNormalized)
  if (!isEntryInQuery && !isQueryInEntry) return null
  const score = Math.min(95, 70 + Math.min(entryNormalized.length, normalized.length) * 2)
  return { score, match: score >= 80, matchedName: entry.n, type: entry.t, program: entry.p }
}

function tryTokenMatch(
  queryTokens: string[],
  entry: SdnEntry,
  minRatio: number,
  maxScore: number
): MatchResult | null {
  const entryTokens = tokenize(normalize(entry.n))
  const tmr = tokenMatchRatio(queryTokens, entryTokens)
  if (tmr <= minRatio) return null
  const score = Math.min(maxScore, Math.round(tmr * 100))
  return buildResult(entry, score)
}

function tryLevenshteinMatch(normalized: string, entry: SdnEntry): MatchResult | null {
  const entryNormalized = normalize(entry.n)
  const maxLen = Math.max(normalized.length, entryNormalized.length)
  if (maxLen <= 3) return null
  const dist = levenshtein(normalized, entryNormalized)
  const similarity = 1 - dist / maxLen
  if (similarity <= 0.7) return null
  const score = Math.min(75, Math.round(similarity * 100))
  return buildResult(entry, score)
}

function updateBest(current: MatchResult | null, candidate: MatchResult | null): MatchResult | null {
  if (!candidate) return current
  if (!current || candidate.score > current.score) return candidate
  return current
}

export function matchName(query: string, entries: SdnEntry[]): MatchResult | null {
  const normalized = normalize(query)
  if (!normalized) return null

  const queryTokens = tokenize(normalized)
  if (queryTokens.length === 0) return null

  let best: MatchResult | null = null

  for (const entry of entries) {
    const exact = tryExactMatch(normalized, entry)
    best = updateBest(best, exact)
    if (exact) continue

    const substring = trySubstringMatch(normalized, entry)
    best = updateBest(best, substring)
    if (substring) continue

    const token = tryTokenMatch(queryTokens, entry, 0.6, 85)
    best = updateBest(best, token)
    if (token) continue

    const lev = tryLevenshteinMatch(normalized, entry)
    best = updateBest(best, lev)
  }

  return best
}

function computeScore(normalized: string, queryTokens: string[], entryNormalized: string, entryTokens: string[]): number {
  if (normalized === entryNormalized) return 100
  if (entryNormalized.includes(normalized) || normalized.includes(entryNormalized)) {
    return 70 + Math.min(entryNormalized.length, normalized.length)
  }
  const tmr = tokenMatchRatio(queryTokens, entryTokens)
  if (tmr > 0.5) return Math.round(tmr * 90)
  const maxLen = Math.max(normalized.length, entryNormalized.length)
  if (maxLen <= 3) return 0
  return Math.round((1 - levenshtein(normalized, entryNormalized) / maxLen) * 100)
}

export function matchNameBulk(
  query: string,
  entries: SdnEntry[],
  limit = 5
): MatchResult[] {
  const normalized = normalize(query)
  if (!normalized) return []

  const queryTokens = tokenize(normalized)
  if (queryTokens.length === 0) return []

  const results: { result: MatchResult; score: number }[] = []

  for (const entry of entries) {
    const entryNormalized = normalize(entry.n)
    const entryTokens = tokenize(entryNormalized)
    const score = computeScore(normalized, queryTokens, entryNormalized, entryTokens)

    if (score >= 60) {
      results.push({ score, result: buildResult(entry, score) })
    }
  }

  return results
    .toSorted((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.result)
}
