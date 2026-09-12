import { expect, test } from '@jest/globals'
import '@testing-library/jest-dom/jest-globals'
import { render, screen } from '@testing-library/react'
import { Home } from './index'

test('renders the Booking App heading', () => {
  render(<Home />)

  expect(
    screen.getByRole('heading', { name: 'Booking App', level: 1 }),
  ).toBeInTheDocument()
})
