import { blue } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

export const applicationTheme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: blue,
  },
})
