import { TitanDropdown } from '../../../components/TitanDropdown'
import { TitanSwitch } from '../../../components/TitanSwitch'
import { useCurrency } from '../hooks/useCurrency'
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '../utils/currency'

export function CurrencyToolbar() {
  const {
    selectedCurrency,
    showConverted,
    setShowConverted,
    setSelectedCurrency,
  } = useCurrency()

  return (
    <section className="glass-panel currency-toolbar" aria-label="Currency preferences">
      <TitanDropdown
        label="Currency"
        options={SUPPORTED_CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
        value={selectedCurrency}
        onChange={(value) => setSelectedCurrency(value as SupportedCurrency)}
      />
      <TitanSwitch
        checked={showConverted}
        label="Show converted values"
        onChange={setShowConverted}
      />
    </section>
  )
}
