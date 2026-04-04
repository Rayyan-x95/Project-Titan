import { useCurrency } from '../hooks/useCurrency'

type CurrencyAmountProps = {
  amountInInr: number
  className?: string
}

export function CurrencyAmount({ amountInInr, className }: CurrencyAmountProps) {
  const { showConverted, selectedCurrency, formatINR, formatConverted } = useCurrency()

  return (
    <span className={className}>
      {formatINR(amountInInr)}
      {showConverted && selectedCurrency !== 'INR' ? ` (${formatConverted(amountInInr)})` : ''}
    </span>
  )
}
