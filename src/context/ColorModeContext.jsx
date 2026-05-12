import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getDesignTokens } from '../theme'

const ColorModeContext = createContext({ mode: 'light', compact: false, toggleColorMode: () => {}, toggleCompactMode: () => {} })

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState('light')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('erp-ui-settings') || 'null')
    if (saved?.mode) setMode(saved.mode)
    if (typeof saved?.compact === 'boolean') setCompact(saved.compact)
  }, [])

  useEffect(() => {
    localStorage.setItem('erp-ui-settings', JSON.stringify({ mode, compact }))
    if (typeof document !== 'undefined') {
      document.body.dataset.colorMode = mode
    }
  }, [mode, compact])

  const colorMode = useMemo(
    () => ({
      mode,
      compact,
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      toggleCompactMode: () => setCompact((prev) => !prev),
    }),
    [mode, compact]
  )

  const theme = useMemo(() => createTheme(getDesignTokens(mode, compact)), [mode, compact])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ColorModeContext.Provider>
  )
}

export const useColorMode = () => useContext(ColorModeContext)
