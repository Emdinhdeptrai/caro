document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const dimensionButton = document.getElementById('dimension-button');
  const dimensionElement = document.getElementById('dimension');
  const statusElement = document.getElementById('status');
  const restartButton = document.getElementById('restart-btn');
  const undoButton = document.getElementById('undo-btn');
  const singlePlayerToggle = document.getElementById('single-player-toggle');
  const boardElement = document.getElementById('board');

  // Game State Variables
  let dimension = 10;
  dimensionButton.textContent = `${dimension}x${dimension}`;

  let singlePlayerMode = false;
  let squares = Array(dimension).fill(null).map(() => Array(dimension).fill(null));
  let moveHistory = []; // Track move history for undo functionality

  let xIsNext = Math.random() < 0.5;
  let theWinner = null;
  let winningLine = [];

  const dimensions = [10, 12, 16, 20];
  let dimensionIndex = 0;

  // Event Listeners
  dimensionButton.addEventListener('click', function () {
    dimensionIndex = (dimensionIndex + 1) % dimensions.length;
    dimension = dimensions[dimensionIndex];
    dimensionButton.textContent = `${dimension}x${dimension}`;
    restartGame();
  });

  restartButton.addEventListener('click', restartGame);

  undoButton.addEventListener('click', function() {
    undoLastMove();
  });

  singlePlayerToggle.addEventListener('click', function () {
    toggleSinglePlayerMode();
    restartGame();
    if (singlePlayerMode && !xIsNext) {
      makeComputerMove();
    }
  });

  // Game Functions
  function handleClick(row, col) {
    if (theWinner || squares[row][col]) {
      return;
    }

    // Save current state to history before making move
    const currentState = {
      squares: squares.map(row => [...row]),
      xIsNext: xIsNext,
      winner: theWinner,
      winningLine: [...winningLine]
    };
    moveHistory.push(currentState);

    const newSquares = squares.map((row) => [...row]);
    newSquares[row][col] = xIsNext ? 'X' : 'O';
    squares = newSquares;
    xIsNext = !xIsNext;

    const winner = calculateWinner(newSquares, row, col);
    if (winner) {
      theWinner = winner;
      winningLine = findWinningLine(newSquares, row, col, winner);
    }

    renderBoard();
    updateStatus();
    updateUndoButton();

    if (singlePlayerMode && !theWinner && !xIsNext) {
      setTimeout(() => {
        makeComputerMove();
      }, 500); // Small delay for better UX
    }
  }

  function undoLastMove() {
    if (moveHistory.length === 0) {
      return;
    }

    // In single player mode, undo both player and computer moves
    if (singlePlayerMode && moveHistory.length >= 2) {
      // Undo computer move first
      const computerState = moveHistory.pop();
      // Then undo player move
      const playerState = moveHistory.pop();
      
      squares = playerState.squares;
      xIsNext = playerState.xIsNext;
      theWinner = playerState.winner;
      winningLine = playerState.winningLine;
    } else {
      // Undo single move in two-player mode
      const previousState = moveHistory.pop();
      squares = previousState.squares;
      xIsNext = previousState.xIsNext;
      theWinner = previousState.winner;
      winningLine = previousState.winningLine;
    }

    renderBoard();
    updateStatus();
    updateUndoButton();
  }

  function updateUndoButton() {
    undoButton.disabled = moveHistory.length === 0;
  }

  function calculateWinner(currentSquares, row, col) {
    const currentPlayer = currentSquares[row][col];

    // Check horizontally
    let count = 1;
    let leftCol = col - 1;
    while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
      count++;
      leftCol--;
    }
    let rightCol = col + 1;
    while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
      count++;
      rightCol++;
    }
    if (count >= 5) {
      return currentPlayer;
    }

    // Check vertically
    count = 1;
    let topRow = row - 1;
    while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
      count++;
      topRow--;
    }
    let bottomRow = row + 1;
    while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
      count++;
      bottomRow++;
    }
    if (count >= 5) {
      return currentPlayer;
    }

    // Check diagonally (top-left to bottom-right)
    count = 1;
    let topLeftRow = row - 1;
    let topLeftCol = col - 1;
    while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
      count++;
      topLeftRow--;
      topLeftCol--;
    }
    let bottomRightRow = row + 1;
    let bottomRightCol = col + 1;
    while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
      count++;
      bottomRightRow++;
      bottomRightCol++;
    }
    if (count >= 5) {
      return currentPlayer;
    }

    // Check diagonally (top-right to bottom-left)
    count = 1;
    let topRightRow = row - 1;
    let topRightCol = col + 1;
    while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
      count++;
      topRightRow--;
      topRightCol++;
    }
    let bottomLeftRow = row + 1;
    let bottomLeftCol = col - 1;
    while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
      count++;
      bottomLeftRow++;
      bottomLeftCol--;
    }
    if (count >= 5) {
      return currentPlayer;
    }

    return null;
  }

  function findWinningLine(currentSquares, row, col, winner) {
    const currentPlayer = currentSquares[row][col];
    let lines = [];

    // Check horizontally
    let leftCol = col - 1;
    while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
      lines.push([row, leftCol]);
      leftCol--;
    }
    lines.push([row, col]);
    let rightCol = col + 1;
    while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
      lines.push([row, rightCol]);
      rightCol++;
    }
    if (lines.length >= 5) {
      return lines;
    }

    // Reset lines for vertical check
    lines = [];
    let topRow = row - 1;
    while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
      lines.push([topRow, col]);
      topRow--;
    }
    lines.push([row, col]);
    let bottomRow = row + 1;
    while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
      lines.push([bottomRow, col]);
      bottomRow++;
    }
    if (lines.length >= 5) {
      return lines;
    }

    // Reset lines for diagonal check (top-left to bottom-right)
    lines = [];
    let topLeftRow = row - 1;
    let topLeftCol = col - 1;
    while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
      lines.push([topLeftRow, topLeftCol]);
      topLeftRow--;
      topLeftCol--;
    }
    lines.push([row, col]);
    let bottomRightRow = row + 1;
    let bottomRightCol = col + 1;
    while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
      lines.push([bottomRightRow, bottomRightCol]);
      bottomRightRow++;
      bottomRightCol++;
    }
    if (lines.length >= 5) {
      return lines;
    }

    // Reset lines for diagonal check (top-right to bottom-left)
    lines = [];
    let topRightRow = row - 1;
    let topRightCol = col + 1;
    while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
      lines.push([topRightRow, topRightCol]);
      topRightRow--;
      topRightCol++;
    }
    lines.push([row, col]);
    let bottomLeftRow = row + 1;
    let bottomLeftCol = col - 1;
    while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
      lines.push([bottomLeftRow, bottomLeftCol]);
      bottomLeftRow++;
      bottomLeftCol--;
    }
    if (lines.length >= 5) {
      return lines;
    }

    return [];
  }

  function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < dimension; row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'board-row';

      for (let col = 0; col < dimension; col++) {
        const value = squares[row][col];
        const isWinningSquare = winningLine.some(([winRow, winCol]) => winRow === row && winCol === col);

        const squareButton = document.createElement('button');
        squareButton.className = 'square';
        squareButton.style.backgroundColor = isWinningSquare ? 'yellow' : 'white';
        squareButton.style.color = value === 'X' ? 'blue' : 'red';
        squareButton.style.fontWeight = isWinningSquare ? 'bold' : 'normal';
        squareButton.textContent = value;
        squareButton.addEventListener('click', () => {
          if (!singlePlayerMode || (singlePlayerMode && xIsNext)) {
            handleClick(row, col);
          }
        });

        rowElement.appendChild(squareButton);
      }

      boardElement.appendChild(rowElement);
    }
  }

  function updateStatus() {
    if (theWinner) {
      statusElement.textContent = `Chiến thắng: ${theWinner}`;
    } else {
      statusElement.textContent = `Người chơi: ${xIsNext ? 'X' : 'O'}`;
    }
  }

  function restartGame() {
    squares = Array(dimension).fill(null).map(() => Array(dimension).fill(null));
    moveHistory = [];
    xIsNext = true; 
    theWinner = null;
    winningLine = [];
    renderBoard();
    updateStatus();
    updateUndoButton();
  }

  function makeComputerMove() {
    if (!singlePlayerMode || theWinner) {
      return;
    }

    const availableMoves = [];
    const humanPlayer = xIsNext ? 'X' : 'O';
    const computerPlayer = xIsNext ? 'O' : 'X';

    squares.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (!squares[rowIndex][colIndex]) {
          availableMoves.push([rowIndex, colIndex]);
        }
      });
    });

    if (availableMoves.length > 0) {
      // Check if the computer can win in the next move
      for (let i = 0; i < availableMoves.length; i++) {
        const [row, col] = availableMoves[i];
        const newSquares = squares.map((row) => [...row]);
        newSquares[row][col] = computerPlayer;

        if (calculateWinner(newSquares, row, col) === computerPlayer) {
          handleClick(row, col);
          return;
        }
      }

      // Check if the human player can win in the next move
      for (let i = 0; i < availableMoves.length; i++) {
        const [row, col] = availableMoves[i];
        const newSquares = squares.map((row) => [...row]);
        newSquares[row][col] = humanPlayer;

        if (calculateWinner(newSquares, row, col) === humanPlayer) {
          handleClick(row, col);
          return;
        }
      }

      // Random move for normal difficulty
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      const [row, col] = availableMoves[randomIndex];

      // Choose a winning move for hard difficulty
      if (availableMoves.length >= 3) {
        for (let i = 0; i < availableMoves.length; i++) {
          const [row, col] = availableMoves[i];
          const newSquares = squares.map((row) => [...row]);
          newSquares[row][col] = computerPlayer;

          if (isWinningMove(newSquares, computerPlayer)) {
            handleClick(row, col);
            return;
          }
        }
      }

      handleClick(row, col);
    }
  }

  function isWinningMove(currentSquares, player) {
    for (let row = 0; row < dimension; row++) {
      for (let col = 0; col < dimension; col++) {
        if (!currentSquares[row][col]) {
          const newSquares = currentSquares.map((row) => [...row]);
          newSquares[row][col] = player;
          if (calculateWinner(newSquares, row, col) === player) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function toggleSinglePlayerMode() {
    singlePlayerMode = !singlePlayerMode;
    if (singlePlayerMode) {
      singlePlayerToggle.innerHTML = '&#x1F4BB;';
    } else {
      singlePlayerToggle.innerHTML = '&#x1F477; ';
    }
  }

  // Initialize the game
  renderBoard();
  updateStatus();
  updateUndoButton();
});
