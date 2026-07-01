import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type PageTitleContextValue = {
  defaultTitle: string
  setPageTitle: (title?: string | null) => void
  formatTitle: (title?: string | null) => string
}

const DEFAULT_TITLE = 'BookNest'

const PageTitleContext = createContext<PageTitleContextValue | null>(null)

type PageTitleProviderProps = {
  children: React.ReactNode
  defaultTitle?: string
}

export function PageTitleProvider({
  children,
  defaultTitle = DEFAULT_TITLE,
}: PageTitleProviderProps): React.ReactElement {
  const [pageTitle, setPageTitle] = useState<string>(defaultTitle)

  useEffect(() => {
    setPageTitle(defaultTitle)
  }, [defaultTitle])

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  const value = useMemo<PageTitleContextValue>(() => {
    const formatTitle = (title?: string | null): string => {
      const trimmedTitle = title?.trim()

      if (!trimmedTitle) {
        return defaultTitle
      }

      return `${trimmedTitle} | ${defaultTitle}`
    }
    return {
      defaultTitle,
      setPageTitle: (title) => {
        setPageTitle(formatTitle(title))
      },
      formatTitle,
    }
  }, [defaultTitle])

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle(title?: string | null): void {
  const context = useContext(PageTitleContext)

  if (!context) {
    throw new Error('usePageTitle must be used within a PageTitleProvider')
  }

  useEffect(() => {
    context.setPageTitle(title)

    return () => {
      context.setPageTitle()
    }
  }, [context, title])
}
