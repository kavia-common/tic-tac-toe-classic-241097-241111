import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders game shell and allows a move + reset", () => {
  render(<App />);

  // Shell renders
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByText(/status/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /reset game/i })
  ).toBeInTheDocument();

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
  expect(screen.getByRole("button", { name: /square 1, empty/i })).toBeEnabled();
});

test("detects a winner and locks the board after game over", () => {
  render(<App />);

  // X wins on top row: 1,2,3
  fireEvent.click(screen.getByRole("button", { name: /square 1, empty/i })); // X
  fireEvent.click(screen.getByRole("button", { name: /square 4, empty/i })); // O
  fireEvent.click(screen.getByRole("button", { name: /square 2, empty/i })); // X
  fireEvent.click(screen.getByRole("button", { name: /square 5, empty/i })); // O
  fireEvent.click(screen.getByRole("button", { name: /square 3, empty/i })); // X wins

  expect(screen.getByText(/winner: x/i)).toBeInTheDocument();

  // Board should be locked: empty squares disabled
  expect(screen.getByRole("button", { name: /square 6, empty/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /square 7, empty/i })).toBeDisabled();

  // Reset should unlock
  fireEvent.click(screen.getByRole("button", { name: /reset game/i }));
  expect(screen.getByText(/next player: x/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /square 6, empty/i })).toBeEnabled();
});
