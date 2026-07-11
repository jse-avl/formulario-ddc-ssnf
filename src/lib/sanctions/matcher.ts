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

export function matchName(query: string, entries: SdnEntry[]): MatchResult | null {
  const normalized = normalize(query)
  if (!normalized) return null

  const queryTokens = tokenize(normalized)
  if (queryTokens.length === 0) return null

  let best: MatchResult | null = null

  for (const entry of entries) {
    const entryNormalized = normalize(entry.n)
    const entryTokens = tokenize(entryNormalized)

    // Exact match
    if (normalized === entryNormalized) {
      const r: MatchResult = {
        score: 100,
        match: true,
        matchedName: entry.n,
        type: entry.t,
        program: entry.p,
      }
      if (!best || r.score > best.score) best = r
      continue
    }

    // Substring match
    if (entryNormalized.includes(normalized) || normalized.includes(entryNormalized)) {
      const score = Math.min(95, 70 + Math.min(entryNormalized.length, normalized.length) * 2)
      const r: MatchResult = {
        score,
        match: score >= 80,
        matchedName: entry.n,
        type: entry.t,
        program: entry.p,
      }
      if (!best || r.score > best.score) {
        if (!best || r.score > best.score) best = r
      }
      continue
    }

    // Token match ratio
    const tmr = tokenMatchRatio(queryTokens, entryTokens)
    if (tmr > 0.6) {
      const score = Math.min(85, Math.round(tmr * 100))
      const r: MatchResult = {
        score,
        match: score >= 75,
        matchedName: entry.n,
        type: entry.t,
        program: entry.p,
      }
      if (!best || r.score > best.score) best = r
      continue
    }

    // Levenshtein for similar-length names
    const maxLen = Math.max(normalized.length, entryNormalized.length)
    if (maxLen > 3) {
      const dist = levenshtein(normalized, entryNormalized)
      const similarity = 1 - dist / maxLen
      if (similarity > 0.7) {
        const score = Math.min(75, Math.round(similarity * 100))
        const r: MatchResult = {
          score,
          match: score >= 70,
          matchedName: entry.n,
          type: entry.t,
          program: entry.p,
        }
        if (!best || r.score > best.score) best = r
      }
    }
  }

  return best
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

    let score = 0

    if (normalized === entryNormalized) {
      score = 100
    } else if (entryNormalized.includes(normalized) || normalized.includes(entryNormalized)) {
      score = 70 + Math.min(entryNormalized.length, normalized.length)
    } else {
      const tmr = tokenMatchRatio(queryTokens, entryTokens)
      if (tmr > 0.5) score = Math.round(tmr * 90)
      else {
        const maxLen = Math.max(normalized.length, entryNormalized.length)
        if (maxLen > 3) {
          const dist = levenshtein(normalized, entryNormalized)
          score = Math.round((1 - dist / maxLen) * 100)
        }
      }
    }

    if (score >= 60) {
      results.push({
        score,
        result: {
          score,
          match: score >= 70,
          matchedName: entry.n,
          type: entry.t,
          program: entry.p,
        },
      })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.result)
}
