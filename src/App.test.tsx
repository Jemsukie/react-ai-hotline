import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Jemwealth AI Hotline', () => {
  render(<App />)
  const headingElement = screen.getByText(/Jemwealth AI Hotline/i)
  expect(headingElement).toBeInTheDocument()
})
