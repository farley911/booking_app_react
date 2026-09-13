import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useState, type ReactNode } from 'react'

import { applicationTheme } from './application-theme'

export function ApplicationThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [emotionCache] = useState(() => createCache({ key: 'mui' }))

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={applicationTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
