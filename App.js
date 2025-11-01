import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const defaultSettings = {
  easy: { size: 4, bombs: 6 },
  medium: { size: 6, bombs: 10 },
  hard: { size: 8, bombs: 15 }
};

const cloneGrid = (grid) => grid.map(row => [...row]);

const getNeighbors = (r, c, size) => {
  const neighbors = [];
  if (r > 0) neighbors.push([r - 1, c]);
  if (r < size - 1) neighbors.push([r + 1, c]);
  if (c > 0) neighbors.push([r, c - 1]);
  if (c < size - 1) neighbors.push([r, c + 1]);
  return neighbors;
};

export default function ChainReaction() {
  const [difficulty, setDifficulty] = useState("medium");
  const { size, bombs } = defaultSettings[difficulty];
  const [grid, setGrid] = useState([]);
  const [bombsLeft, setBombsLeft] = useState(bombs);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  const resetGame = () => {
    setGrid(Array(size).fill(null).map(() => Array(size).fill(0)));
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
          setScore((s) => s + 10);
        }
      });
    });

    setGrid(newGrid);
    setTimeout(() => explode(newGrid, nextQueue), 400);
  };

  const checkWin = (board) => {
    const safeLeft = board.flat().filter((c) => c === 0).length;
    if (safeLeft === 0) {
      setMessage("🎉 You cleared the board! You win!");
    } else if (bombsLeft === 0) {
      setMessage("😢 No bombs left! Try again!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#000000] text-white">
      <h1 className="text-4xl font-bold mb-4">💣 Chain Reaction</h1>

      <div className="flex gap-3 mb-4">
        {Object.keys(defaultSettings).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              difficulty === lvl
                ? "bg-pink-600 scale-105"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
        >
          🔄 Reset
        </button>
      </div>

      <p className="mb-3">
        Bombs left: <b>{bombsLeft}</b> | Score: <b>{score}</b>
      </p>

      {/* GRID */}
      <div
        className="p-4 rounded-xl shadow-lg border border-gray-500 bg-gray-800"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 60px)`,
          gap: "6px",
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            let bg = "bg-gray-700";
            let emoji = "";

            if (cell === 1) {
              bg = "bg-yellow-400 text-black";
              emoji = "💣";
            } else if (cell === 2) {
              bg = "bg-red-500 text-white";
              emoji = "💥";
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => placeBomb(r, c)}
                className={`${bg} w-[60px] h-[60px] flex justify-center items-center rounded-md border border-gray-900 cursor-pointer text-2xl font-bold transition-all`}
              >
                {emoji}
              </motion.div>
            );
          })
        )}
      </div>

      {message && (
        <motion.p
          className="mt-5 text-2xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
