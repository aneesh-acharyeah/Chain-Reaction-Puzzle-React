import React, { useState } from "react";

const SIZE = 6;     // Grid size 6x6
const MAX_BOMBS = 10; // Number of bombs player can place


const cloneGrid = (grid) => grid.map(row => row.slice());


const getNeighbors = (r, c, size) => {
  const neighbors = [];
  if (r > 0) neighbors.push([r - 1, c]);
  if (r < size - 1) neighbors.push([r + 1, c]);
  if (c > 0) neighbors.push([r, c - 1]);
  if (c < size - 1) neighbors.push([r, c + 1]);
  return neighbors;
};

export default function ChainReaction() {
  const [grid, setGrid] = useState(() =>
    Array(SIZE).fill(null).map(() => Array(SIZE).fill(0))
  );
  const [bombsLeft, setBombsLeft] = useState(MAX_BOMBS);
  const [message, setMessage] = useState("");


  const placeBomb = (r, c) => {
    if (bombsLeft <= 0 || grid[r][c] !== 0) {
      setMessage("No bombs left or cell already exploded!");
      return;
    }
    setMessage("");
    const newGrid = cloneGrid(grid);
    newGrid[r][c] = 1; 
    setBombsLeft(bombsLeft - 1);
    setGrid(newGrid);
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
      newGrid[r][c] = 2; 
      getNeighbors(r, c, SIZE).forEach(([nr, nc]) => {
        if (newGrid[nr][nc] === 0) {
          newGrid[nr][nc] = 1; 
          nextQueue.push([nr, nc]);
        }
      });
    });

    setTimeout(() => explode(newGrid, nextQueue), 400);
  };

  const checkWin = (board) => {
    
    let safeLeft = 0;
    board.forEach(row =>
      row.forEach(cell => {
        if (cell === 0) safeLeft += 1;
      })
    );
    if (safeLeft === 0) {
      setMessage("You cleared the board! You win!");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>Chain Reaction Puzzle</h1>
      <div>Bombs left: {bombsLeft}</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SIZE}, 50px)`,
        gridGap: 4,
        marginTop: 10
      }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            let bg = "#e0e0e0";
            if (cell === 1) bg = "#ffcc00"; 
            else if (cell === 2) bg = "#ff6600"; 
            return (
              <div key={`${r}-${c}`} onClick={() => placeBomb(r, c)}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: bg,
                  border: "1px solid #999",
                  cursor: bombsLeft > 0 && cell === 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                  userSelect: "none"
                }}>
                {cell === 0 ? "" : cell === 1 ? "💣" : "💥"}
              </div>
            )
          })
        )}
      </div>
      {message && <p style={{ marginTop: 20, fontWeight: "bold" }}>{message}</p>}
      {bombsLeft === 0 && !message && <p>Place all bombs to clear board!</p>}
    </div>
  );
}
