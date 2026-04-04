interface CurrencyToolbarProps {
  currency: string
  changeCurrency: (newCurrency: string) => void
}

const CurrencyToolbar: React.FC<CurrencyToolbarProps> = ({ currency, changeCurrency }) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ]

  const selectedCurrencies = currencies.filter(c => c.code === currency)

  return (
    <div className="currency-toolbar">
      <div className="currency-info">
        <span className="currency-code">{currency}</span>
        <span className="currency-name">{selectedCurrencies[0]?.name}</span>
      </div>
      <div className="currency-actions">
        {selectedCurrencies.map(c => (
          <button
            key={c.code}
            className={`currency-btn ${currency === c.code ? 'active' : ''}`}
            onClick={() => changeCurrency(c.code)}
          >
            <span className="currency-symbol">{c.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { CurrencyToolbar }
