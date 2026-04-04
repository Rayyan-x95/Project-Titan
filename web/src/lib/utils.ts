/**
 * Core utilities for Project Titan
 * Modernized, TypeScript-safe implementations
 */

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatDateRange = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date) + ' - ' + formatDate(new Date(Date.now() + 86400000))
}

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value)
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatFileSize = (bytes: number): string => {
  return formatBytes(bytes)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export const useDarkMode = () => {
  const [isDark, setIsDark] = useLocalStorage('isDark', false)

  const toggle = () => setIsDark(!isDark)

  return { isDark, toggle }
}

export const useWindowSize = (): [number, number] => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useLayoutEffect(() => {
    setWindowSize({
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0
    })
  }, [windowSize])

  return windowSize
}

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    id: number
    title: string
    message: string
    visible: boolean
    onClose: () => void
  } | null>(null)

  const notify = (title: string, message: string) => {
    setNotification({
      id: Date.now(),
      title,
      message,
      visible: true,
      onClose: () => setNotification(null)
    })
  }

  const dismiss = () => setNotification(null)

  const close = () => {
    if (notification?.visible) {
      setNotification(null)
      if (typeof window !== 'undefined') {
        const notificationElement = document.getElementById('notification')
        if (notificationElement) {
          notificationElement.remove()
        }
      }
    }
  }

  return {
    notification,
    notify,
    close,
    dismiss
  }
}
