import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DECRYPT button', () => {
  render(<App />);
  const button = screen.getByText(/decrypt/i);
  expect(button).toBeInTheDocument();
});
