type LocalAccount = {
  email: string
  passwordHash: string
  displayName: string
  createdAt: number
}

const ACCOUNTS_KEY = 'titan-local-accounts-v1'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function readAccounts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as LocalAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

async function createPasswordHash(password: string) {
  if (!password) {
    return ''
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(password)
    const digest = await crypto.subtle.digest('SHA-256', encoded)
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')
  }

  let hash = 0
  for (let index = 0; index < password.length; index += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(index)
    hash |= 0
  }

  return `fallback-${Math.abs(hash)}`
}

export async function registerLocalAccount(input: {
  email: string
  password: string
  displayName: string
}) {
  const email = normalizeEmail(input.email)
  const accounts = readAccounts()

  if (accounts.some((account) => account.email === email)) {
    return { ok: false as const, reason: 'exists' as const }
  }

  const passwordHash = await createPasswordHash(input.password)
  const nextAccount: LocalAccount = {
    email,
    passwordHash,
    displayName: input.displayName.trim() || email.split('@')[0] || 'Titan user',
    createdAt: Date.now(),
  }

  writeAccounts([nextAccount, ...accounts])
  return { ok: true as const, displayName: nextAccount.displayName }
}

export async function authenticateLocalAccount(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput)
  const account = readAccounts().find((item) => item.email === email)

  if (!account) {
    return null
  }

  const passwordHash = await createPasswordHash(password)
  if (account.passwordHash !== passwordHash) {
    return null
  }

  return {
    displayName: account.displayName,
  }
}
