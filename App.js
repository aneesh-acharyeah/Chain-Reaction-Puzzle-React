import React, { useState, useEffect } from "react";

const defaultSettings = {
  easy: { size: 4, bombs: 6 },
  medium: { size: 6, bombs: 10 },
  hard: { size: 8, bombs: 15 }
};

const cloneGrid = (grid) => grid.map(row => row.slice());
const getNeighbors = (r, c, size) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  return dirs.map(([dr,dc]) => [r+dr,c+dc])
             .filter(([nr,nc]) => nr>=0 && nc>=0 && nr<size && nc<size);
};

export default function ChainReaction() {
  const [difficulty, setDifficulty] = useState("medium");
  const { size, bombs } = defaultSettings[difficulty];
  const [grid, setGrid] = useState(() => Array(size).fill(null).map(()=>Array(size).fill(0)));
  const [bombsLeft, setBombsLeft] = useState(bombs);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  const resetGame = () => {
    setGrid(Array(size).fill(null).map(()=>Array(size).fill(0)));
    setBombsLeft(bombs);
    setMessage("");
    setScore(0);
  };

  const placeBomb = (r, c) => {
    if (bombsLeft <= 0 || grid[r][c] !== 0) return;
    const newGrid = cloneGrid(grid);
    newGrid[r][c] = 1;
    setBombsLeft(bombsLeft - 1);
    explode(newGrid, [[r, c]]);
  };

  const explode = (currentGrid, queue) => {
    if (queue.length === 0) {
      setGrid(currentGrid);
      checkWin(currentGrid);
      return;
    }
    const newGrid = cloneGrid(currentGrid);
    const nextQueue = [];

    queue.forEach(([r, c]) => {
      newGrid[r][c] = 2; // Exploded
      getNeighbors(r, c, size).forEach(([nr, nc]) => {
        if (newGrid[nr][nc] === 0) {
          newGrid[nr][nc] = 1;
          nextQueue.push([nr, nc]);
          setScore(s => s + 10);
        }
      });
    });

    setGrid(newGrid);
    setTimeout(() => explode(newGrid, nextQueue), 400);
  };

  const checkWin = (board) => {
    const safeLeft = board.flat().filter(c => c === 0).length;
    if (safeLeft === 0) {
      setMessage("🎉 You cleared the board! You win!");
    } else if (bombsLeft === 0) {
      setMessage("😢 No bombs left! Try again!");
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 font-sans">
      <h1 className="text-3xl font-bold mb-2">💥 Chain Reaction</h1>

      <div className="flex gap-2 mb-4">
        {Object.keys(defaultSettings).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-3 py-1 rounded-lg text-white ${
              difficulty === lvl ? "bg-orange-600" : "bg-gray-500"
            }`}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
        <button
          onClick={resetGame}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg"
        >
          🔄 Reset
        </button>
      </div>

      <p>Bombs left: <b>{bombsLeft}</b> | Score: <b>{score}</b></p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 50px)`,
          gap: 5,
          marginTop: 10
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            let bg = "#e0e0e0";
            let content = "";
            if (cell === 1) { bg = "#FFD54F"; content = "💣"; }
            else if (cell === 2) { bg = "#FF7043"; content = "💥"; }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => placeBomb(r, c)}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: bg,
                  border: "2px solid #555",
                  cursor: bombsLeft > 0 && cell === 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  transition: "all 0.3s",
                  fontSize: 22,
                  fontWeight: "bold"
                }}
              >
                {content}
              </div>
            );
          })
        )}
      </div>

      {message && (
        <p className="mt-4 text-lg font-bold">{message}</p>
      )}
    </div>
  );
}
