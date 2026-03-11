import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders game shell and allows a move + reset", () => {
  render(<App />);

  // Shell renders
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByText(/status/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /reset game/i })).toBeInTheDocument();

  // Initial status
  expect(screen.getByText(/next player: x/i)).toBeInTheDocument();

  // Make a move
  const square1 = screen.getByRole("button", { name: /square 1, empty/i });
  fireEvent.click(square1);

  // After move, next player switches
  expect(screen.getByText(/next player: o/i)).toBeInTheDocument();

  // Reset restores initial state
  fireEvent.click(screen.getByRole("button", { name: /reset game/i }));
  expect(screen.getByText(/next player: x/i)).toBeInTheDocument();
});
