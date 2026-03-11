import React, { useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 9;

/**
 * Returns the winner symbol ("X" or "O") if there is a winner, otherwise null.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {"X"|"O"|null}
 */
function calculateWinner(squares) {
  const lines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diags
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return v;
  }
  return null;
}

/**
 * Returns indexes that form a winning line, otherwise null.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {number[]|null}
 */
function calculateWinningLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return line;
  }
  return null;
}

/**
 * True if all squares are filled.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {boolean}
 */
function isBoardFull(squares) {
  return squares.every((s) => s !== null);
}

// PUBLIC_INTERFACE
function App() {
  /** @type {[Array<"X"|"O"|null>, Function]} */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  /** @type {["X"|"O", Function]} */
  const [nextPlayer, setNextPlayer] = useState("X");

  const winningLine = useMemo(() => calculateWinningLine(squares), [squares]);
  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(
    () => !winner && isBoardFull(squares),
    [winner, squares]
  );
  const gameOver = Boolean(winner || isDraw);

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw game";
    return `Next player: ${nextPlayer}`;
  }, [winner, isDraw, nextPlayer]);

  // PUBLIC_INTERFACE
  const handleSquareActivate = (index) => {
    if (gameOver) return;
    if (squares[index]) return;

    setSquares((prev) => {
      const copy = prev.slice();
      copy[index] = nextPlayer;
      return copy;
    });

    setNextPlayer((p) => (p === "X" ? "O" : "X"));
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(BOARD_SIZE).fill(null));
    setNextPlayer("X");
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

          <section
            className="statusCard"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="statusLabel">Status</div>
            <div className="statusValue" data-state={winner ? "win" : isDraw ? "draw" : "play"}>
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
