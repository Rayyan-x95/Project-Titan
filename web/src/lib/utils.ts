import { useEffect, useState } from 'react'

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateRange(date: Date) {
  return `${formatDate(date)} - ${formatDate(new Date(date.getTime() + 86_400_000))}`
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const kiloBytes = 1024
  const fixedDecimals = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const sizeIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(kiloBytes)),
    sizes.length - 1,
  )

  return `${Number((bytes / kiloBytes ** sizeIndex).toFixed(fixedDecimals))} ${sizes[sizeIndex]}`
}

export function formatFileSize(bytes: number) {
  return formatBytes(bytes)
}

export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  limit: number,
) {
  let inThrottle = false

  return (...args: TArgs) => {
    if (inThrottle) {
      return
    }

    func(...args)
    inThrottle = true
    setTimeout(() => {
      inThrottle = false
    }, limit)
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('isDark', false)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  return {
    isDark,
    toggle: () => setIsDark(!isDark),
  }
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return [windowSize.width, windowSize.height] as const
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    id: number
    title: string
    message: string
    visible: boolean
    onClose: () => void
  } | null>(null)

  const dismiss = () => setNotification(null)

  const notify = (title: string, message: string) => {
    setNotification({
      id: Date.now(),
      title,
      message,
      visible: true,
      onClose: dismiss,
    })
  }

  return {
    notification,
    notify,
    close: dismiss,
    dismiss,
  }
}
