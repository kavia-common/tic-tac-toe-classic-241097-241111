import React, { useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 9;

/**
 * All winning line combinations for a 3x3 Tic Tac Toe board.
 * Index mapping:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
const WIN_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Returns the winner symbol ("X" or "O") and the winning line indices if there is a winner.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {{ winner: ("X"|"O"|null), line: (number[]|null) }}
 */
function getWinnerInfo(squares) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { winner: v, line };
    }
  }
  return { winner: null, line: null };
}

/**
 * True if all squares are filled.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {boolean}
 */
function isBoardFull(squares) {
  return squares.every((s) => s !== null);
}

/**
 * Determines the next player based on the current board state.
 * X always starts. If counts are equal, X plays next; otherwise O.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {"X"|"O"}
 */
function getNextPlayerFromSquares(squares) {
  const xCount = squares.filter((s) => s === "X").length;
  const oCount = squares.filter((s) => s === "O").length;
  return xCount === oCount ? "X" : "O";
}

// PUBLIC_INTERFACE
function App() {
  /** @type {[Array<"X"|"O"|null>, Function]} */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));

  const { winner, line: winningLine } = useMemo(
    () => getWinnerInfo(squares),
    [squares]
  );

  const isDraw = useMemo(() => !winner && isBoardFull(squares), [winner, squares]);
  const gameOver = Boolean(winner || isDraw);

  // Derive next player from squares to avoid stale-state edge cases.
  const nextPlayer = useMemo(() => getNextPlayerFromSquares(squares), [squares]);

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw game";
    return `Next player: ${nextPlayer}`;
  }, [winner, isDraw, nextPlayer]);

  // PUBLIC_INTERFACE
  const handleSquareActivate = (index) => {
    setSquares((prev) => {
      // Prevent any moves after the game is over (including "double click" races).
      const { winner: w } = getWinnerInfo(prev);
      const draw = !w && isBoardFull(prev);
      if (w || draw) return prev;

      // Prevent overwriting.
      if (prev[index]) return prev;

      const currentPlayer = getNextPlayerFromSquares(prev);
      const copy = prev.slice();
      copy[index] = currentPlayer;
      return copy;
    });
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(BOARD_SIZE).fill(null));
  };

  return (
    <div className="App">
      <main className="shell">
        <header className="top">
          <div className="brand" aria-label="Tic Tac Toe">
            <span className="brandMark" aria-hidden="true">
              TTT
            </span>
            <div className="brandText">
              <h1 className="title">Tic Tac Toe</h1>
              <p className="subtitle">Retro grid. Soft Gray palette.</p>
            </div>
          </div>

          <section className="statusCard" aria-live="polite" aria-atomic="true">
            <div className="statusLabel">Status</div>
            <div
              className="statusValue"
              data-state={winner ? "win" : isDraw ? "draw" : "play"}
            >
              {statusText}
            </div>
          </section>
        </header>

        <section className="center" aria-label="Game board section">
          <div className="boardWrap">
            <div
              className="board"
              role="grid"
              aria-label="Tic Tac Toe board"
              aria-describedby="boardHelp"
            >
              {squares.map((value, idx) => {
                const isWinning = winningLine?.includes(idx) ?? false;
                const isDisabled = gameOver || Boolean(value);
                const label = value
                  ? `Square ${idx + 1}, ${value}`
                  : `Square ${idx + 1}, empty`;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`square ${isWinning ? "square--win" : ""}`}
                    onClick={() => handleSquareActivate(idx)}
                    disabled={isDisabled}
                    role="gridcell"
                    aria-label={label}
                  >
                    <span className="squareInner" aria-hidden="true">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>

            <p id="boardHelp" className="help">
              Use mouse/touch to place your mark. Game ends on win or draw.
            </p>
          </div>
        </section>

        <footer className="bottom">
          <button
            type="button"
            className="btn"
            onClick={resetGame}
            aria-label="Reset game"
          >
            Reset
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;
