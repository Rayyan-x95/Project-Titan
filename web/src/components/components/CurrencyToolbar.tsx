type CurrencyToolbarProps = {
  currency: string
  changeCurrency: (newCurrency: string) => void
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR' },
  { code: 'GBP', name: 'British Pound', symbol: 'GBP' },
  { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CAD' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AUD' },
  { code: 'INR', name: 'Indian Rupee', symbol: 'INR' },
]

export function CurrencyToolbar({ currency, changeCurrency }: CurrencyToolbarProps) {
  const selectedCurrency = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0]

  return (
    <div className="currency-toolbar">
      <div className="currency-info">
        <span className="currency-code">{selectedCurrency.code}</span>
        <span className="currency-name">{selectedCurrency.name}</span>
      </div>
      <div className="currency-actions">
        {CURRENCIES.map((item) => (
          <button
            key={item.code}
            className={`currency-btn ${currency === item.code ? 'active' : ''}`}
            onClick={() => changeCurrency(item.code)}
            type="button"
          >
            <span className="currency-symbol">{item.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
