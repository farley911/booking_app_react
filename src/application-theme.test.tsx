import { expect, test } from '@jest/globals'
import { blue } from '@mui/material/colors'
import { createTheme, useTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { ApplicationThemeProvider } from './ApplicationThemeProvider'
import { applicationTheme } from './application-theme'

const expectedSecondaryMain = createTheme({
  palette: { secondary: blue },
}).palette.secondary.main

function ObservedTheme() {
  const theme = useTheme()

  return (
    <>
      <p>Primary color {theme.palette.primary.main}</p>
      <p>Secondary color {theme.palette.secondary.main}</p>
      <p>Font family {theme.typography.fontFamily}</p>
    </>
  )
}

test('application theme uses the configured palette and typography', () => {
  expect(applicationTheme.palette.primary.main).toBe('#1a237e')
  expect(applicationTheme.palette.secondary.main).toBe(expectedSecondaryMain)
  expect(applicationTheme.typography.fontFamily).toBe(
    '"Roboto", "Helvetica", "Arial", sans-serif',
  )
})

test('application theme provider supplies the application theme to descendants', () => {
  render(
    <ApplicationThemeProvider>
      <ObservedTheme />
    </ApplicationThemeProvider>,
  )

  expect(
    screen.getByText(`Primary color ${applicationTheme.palette.primary.main}`),
  ).toBeInTheDocument()
  expect(
    screen.getByText(
      `Secondary color ${applicationTheme.palette.secondary.main}`,
    ),
  ).toBeInTheDocument()
  expect(
    screen.getByText(`Font family ${applicationTheme.typography.fontFamily}`),
  ).toBeInTheDocument()
})
