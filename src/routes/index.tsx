import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

export function Home() {
  return (
    <main>
      <h1>Booking App</h1>
    </main>
  )
}
