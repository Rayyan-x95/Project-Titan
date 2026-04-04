// Titan Context State Management
// Manages core application state and user preferences

import { createContext, useContext, useState, useEffect } from 'react'

interface TitanContextState {
  isAuthenticated: boolean
  user: User | null
  theme: 'light' | 'dark' | 'system'
  preferences: {
    showNotification: boolean
    language: string
    currency: string
    theme: 'light' | 'dark' | 'system'
  }
  notifications: Notification[]
  isLoading: boolean
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'student' | 'recruiter' | 'guest'
}

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  timestamp: number
}

interface TitanContextType extends TitanContextState {
  setPreferences: (prefs: Partial<TitanContextState['preferences']>) => void
  addNotification: (title: string, message: string) => void
  dismissNotification: (id: number) => void
  toggleTheme: () => void
  toggleNotification: () => void
}

const TitanContext = createContext<TitanContextType | undefined>(undefined)

export function TitanProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [preferences, setPreferences] = useState({
    showNotification: true,
    language: 'en',
    currency: 'USD',
    theme: 'system'
  })

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Auto-detect system theme
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const systemDarkClass = document.documentElement.getAttribute('data-theme') === 'dark'

    if (systemDarkClass) {
      setTheme('dark')
    } else if (typeof window !== 'undefined') {
      setTheme('system')
    }
  }, [])

  // Load preferences from storage
  useEffect(() => {
    const storedPrefs = window.localStorage.getItem('preferences')
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs))
    }

    // Check auth status
    const storedAuth = window.localStorage.getItem('isAuthenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
      setUser(window.localStorage.getItem('user') as User)
    }
  }, [])

  // Add notifications
  useEffect(() => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      title: 'Project Titan',
      message: 'Welcome to the Project Titan dashboard',
      type: 'info',
      timestamp: Date.now()
    }])
    setPreferences({ ...preferences, showNotification: true })
  }, [])

  // Cleanup notifications on component unmount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissNotification()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setPreferences = (newPrefs: Partial<TitanContextState['preferences']>) => {
    setPreferences((prev) => ({
      ...prev,
      ...newPrefs,
      language: newPrefs.language ?? prev.language,
      currency: newPrefs.currency ?? prev.currency,
      theme: newPrefs.theme ?? prev.theme
    }))
  }

  const addNotification = (title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      type: 'info',
      timestamp: Date.now()
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (newNotification.id && newNotification.id in window.localStorage) {
        dismissNotification(newNotification.id)
      }
    }, 5000)
  }

  const dismissNotification = (id: number) => {
    const newNotifications = notifications.filter(n => n.id !== id)
    setNotifications(newNotifications)

    if (id in window.localStorage) {
      window.localStorage.removeItem(`notification_${id}`)
    }
  }

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const toggleNotification = () => {
    setPreferences((prev) => ({
      ...prev,
      showNotification: !prev.showNotification
    }))
  }

  const toggleLanguage = (lang: string) => {
    setPreferences(prev => ({ ...prev, language: lang }))
  }

  const toggleCurrency = (currency: string) => {
    setPreferences(prev => ({ ...prev, currency: currency }))
  }

  return (
    <TitanContext.Provider
      value={{
        isAuthenticated,
        user,
        theme,
        preferences,
        notifications,
        isLoading,
        setPreferences,
        addNotification,
        dismissNotification,
        toggleTheme,
        toggleNotification,
        toggleLanguage,
        toggleCurrency
      }}
    >
      {children}
    </TitanContext.Provider>
  )
}

const useTitan = (): TitanContextType => {
  const context = useContext(TitanContext)
  if (!context) {
    throw new Error('useTitan must be used within a TitanProvider')
  }
  return context
}

export { TitanProvider, useTitan }
