export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AED', 'SGD'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

const currencySymbolByCode: Record<SupportedCurrency, string> = {
  INR: 'INR',
  USD: '$',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  AED: 'AED',
  SGD: 'SGD',
}

export function detectCurrencyFromLocale() {
  const locale = navigator.language || 'en-IN'

  if (locale.includes('en-US')) return 'USD'
  if (locale.includes('en-GB')) return 'GBP'
  if (locale.includes('ja')) return 'JPY'
  if (locale.includes('de') || locale.includes('fr') || locale.includes('es') || locale.includes('it')) return 'EUR'
  if (locale.includes('ar-AE')) return 'AED'
  if (locale.includes('en-SG')) return 'SGD'

  return 'INR'
}

export function formatCurrency(amount: number, currency: SupportedCurrency, locale = navigator.language || 'en-IN') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currencySymbolByCode[currency]} ${amount.toFixed(2)}`
  }
}

export function convertAmount(amountInInr: number, targetCurrency: SupportedCurrency, ratesByCode: Partial<Record<SupportedCurrency, number>>) {
  if (targetCurrency === 'INR') {
    return amountInInr
  }

  const rate = ratesByCode[targetCurrency]
  if (!rate || !Number.isFinite(rate)) {
    return amountInInr
  }

  return amountInInr * rate
}
