import React, { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Given a current index and arrow-key direction, returns the next index in the grid.
 * Navigation wraps within a row/column to keep keyboard usage smooth.
 * @param {number} index
 * @param {"ArrowUp"|"ArrowDown"|"ArrowLeft"|"ArrowRight"} key
 * @returns {number}
 */
function getNextIndexByArrow(index, key) {
  const row = Math.floor(index / 3);
  const col = index % 3;

  if (key === "ArrowLeft") return row * 3 + ((col + 2) % 3);
  if (key === "ArrowRight") return row * 3 + ((col + 1) % 3);
  if (key === "ArrowUp") return ((row + 2) % 3) * 3 + col;
  if (key === "ArrowDown") return ((row + 1) % 3) * 3 + col;

  return index;
}

/**
 * Produces an accessible position label like "row 1, column 2".
 * @param {number} index
 * @returns {string}
 */
function getRowColLabel(index) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  return `row ${row}, column ${col}`;
}

// PUBLIC_INTERFACE
function App() {
  /** @type {[Array<"X"|"O"|null>, Function]} */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  const [focusedIndex, setFocusedIndex] = useState(0);

  /** @type {React.MutableRefObject<Array<HTMLButtonElement|null>>} */
  const squareRefs = useRef(Array(BOARD_SIZE).fill(null));
  const shouldMoveFocusToIndex = useRef(null);
  const lastMoveIndexRef = useRef(null);

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

  const statusAssistiveText = useMemo(() => {
    if (winner) return `Game over. Player ${winner} wins. Press Reset to play again.`;
    if (isDraw) return "Game over. It's a draw. Press Reset to play again.";
    return `Player ${nextPlayer}'s turn. Use arrow keys to move between squares, and press Enter or Space to place your mark.`;
  }, [winner, isDraw, nextPlayer]);

  // PUBLIC_INTERFACE
  const handleSquareActivate = (index) => {
    if (gameOver) return;

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

      // Store for focus update after state is committed.
      lastMoveIndexRef.current = index;
      return copy;
    });
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(BOARD_SIZE).fill(null));
    lastMoveIndexRef.current = null;
    setFocusedIndex(0);
    shouldMoveFocusToIndex.current = 0;
  };

  const handleSquareKeyDown = (event, index) => {
    // Let Tab/Shift+Tab behave normally.
    const key = event.key;

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      handleSquareActivate(index);
      return;
    }

    if (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      event.preventDefault();
      const nextIndex = getNextIndexByArrow(index, key);
      setFocusedIndex(nextIndex);
      shouldMoveFocusToIndex.current = nextIndex;
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      shouldMoveFocusToIndex.current = 0;
      return;
    }

    if (key === "End") {
      event.preventDefault();
      setFocusedIndex(8);
      shouldMoveFocusToIndex.current = 8;
    }
  };

  useEffect(() => {
    // Focus management:
    // - After reset -> focus square 1
    // - After a successful move -> focus next empty square (or keep if none)
    if (shouldMoveFocusToIndex.current !== null) return;

    // If the last move was set, try to advance focus to the next best square.
    const lastMoveIndex = lastMoveIndexRef.current;
    if (lastMoveIndex === null) return;

    if (gameOver) {
      // On game over, keep focus where the last move happened for context.
      setFocusedIndex(lastMoveIndex);
      shouldMoveFocusToIndex.current = lastMoveIndex;
      return;
    }

    // Find next empty square starting from the last move + 1.
    for (let offset = 1; offset <= 9; offset += 1) {
      const candidate = (lastMoveIndex + offset) % 9;
      if (!squares[candidate]) {
        setFocusedIndex(candidate);
        shouldMoveFocusToIndex.current = candidate;
        break;
      }
    }
  }, [squares, gameOver]);

  useEffect(() => {
    // Execute the focus move after React paints.
    if (shouldMoveFocusToIndex.current === null) return;

    const idx = shouldMoveFocusToIndex.current;
    shouldMoveFocusToIndex.current = null;

    const el = squareRefs.current[idx];
    if (el && typeof el.focus === "function") {
      el.focus();
    }
  }, [focusedIndex]);

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
            aria-describedby="statusAssistive"
          >
            <div className="statusLabel">Status</div>
            <div
              className="statusValue"
              data-state={winner ? "win" : isDraw ? "draw" : "play"}
            >
              {statusText}
            </div>
            <p id="statusAssistive" className="srOnly">
              {statusAssistiveText}
            </p>
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

                const ariaLabel = value
                  ? `Square ${idx + 1} (${getRowColLabel(idx)}), ${value}`
                  : `Square ${idx + 1} (${getRowColLabel(idx)}), empty`;

                // Roving-tabindex: only one cell is in tab order; arrows move focus inside grid.
                const tabIndex = idx === focusedIndex ? 0 : -1;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`square ${isWinning ? "square--win" : ""}`}
                    onClick={() => {
                      setFocusedIndex(idx);
                      handleSquareActivate(idx);
                    }}
                    disabled={isDisabled}
                    role="gridcell"
                    aria-label={ariaLabel}
                    aria-disabled={isDisabled}
                    aria-current={isWinning ? "true" : undefined}
                    tabIndex={tabIndex}
                    ref={(el) => {
                      squareRefs.current[idx] = el;
                    }}
                    onFocus={() => setFocusedIndex(idx)}
                    onKeyDown={(e) => handleSquareKeyDown(e, idx)}
                  >
                    <span className="squareInner" aria-hidden="true">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>

            <p id="boardHelp" className="help">
              Keyboard: use Arrow keys to move, Enter/Space to place a mark. Reset
              starts a new game.
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
