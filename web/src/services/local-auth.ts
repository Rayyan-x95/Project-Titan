type LocalAccount = {
  email: string
  passwordHash: string
  displayName: string
  createdAt: number
}

const ACCOUNTS_KEY = 'titan-local-accounts-v1'
const PBKDF2_ALGORITHM = 'pbkdf2'
const PBKDF2_ITERATIONS = 210_000
const PBKDF2_DERIVED_BITS = 256
const PBKDF2_SALT_BYTES = 16

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

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromBase64(value: string) {
  const binary = atob(value)
  const output = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index)
  }
  return output
}

async function derivePbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    PBKDF2_DERIVED_BITS,
  )

  return new Uint8Array(derivedBits)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false
  }

  let mismatch = 0
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index] ^ b[index]
  }

  return mismatch === 0
}

function parsePbkdf2Hash(value: string) {
  const [algorithm, iterationsValue, saltBase64, hashBase64] = value.split('$')
  if (algorithm !== PBKDF2_ALGORITHM || !iterationsValue || !saltBase64 || !hashBase64) {
    return null
  }

  const iterations = Number.parseInt(iterationsValue, 10)
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return null
  }

  try {
    return {
      iterations,
      salt: fromBase64(saltBase64),
      hash: fromBase64(hashBase64),
    }
  } catch {
    return null
  }
}

async function createPasswordHash(password: string) {
  const normalized = password.trim()
  if (!normalized) {
    throw new Error('Password is required')
  }

  if (typeof crypto === 'undefined' || !crypto.subtle || !crypto.getRandomValues) {
    throw new Error('Secure crypto is unavailable')
  }

  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
  const hash = await derivePbkdf2(normalized, salt, PBKDF2_ITERATIONS)

  return `${PBKDF2_ALGORITHM}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function registerLocalAccount(input: {
  email: string
  password: string
  displayName: string
}) {
  const email = normalizeEmail(input.email)
  const accounts = readAccounts()

  if (accounts.some((account) => account.email === email)) {
    return { ok: false as const, code: 'ACCOUNT_EXISTS' as const, reason: 'exists' as const }
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

  const parsed = parsePbkdf2Hash(account.passwordHash)
  if (!parsed) {
    return null
  }

  const normalized = password.trim()
  if (!normalized) {
    return null
  }

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return null
  }

  const derived = await derivePbkdf2(normalized, parsed.salt, parsed.iterations)
  if (!timingSafeEqual(derived, parsed.hash)) {
    return null
  }

  return {
    displayName: account.displayName,
  }
}
