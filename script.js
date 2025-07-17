const socket = io();
let symbol = '';
const board = document.getElementById('board');
const status = document.getElementById('status');
const popup = document.getElementById('popup');

// Create board cells
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  cell.addEventListener('click', () => {
    socket.emit('makeMove', i);
  });
  board.appendChild(cell);
}

socket.on('symbol', s => {
  symbol = s;
  status.textContent = `You are Player ${symbol}`;
});

socket.on('status', msg => {
  status.textContent = msg;
});

socket.on('updateBoard', ({ index, symbol }) => {
  const cell = board.children[index];
  cell.textContent = symbol;

  const winner = checkWinner();
  if (winner) {
    if (winner === symbol) showPopup(`🎉 You Win!`);
    else showPopup(`😞 You Lose!`);
    setTimeout(() => {
      socket.emit('reset');
    }, 3000);
  } else if (isDraw()) {
    showPopup("🤝 It's a Draw!");
    setTimeout(() => {
      socket.emit('reset');
    }, 3000);
  }
});

socket.on('resetBoard', () => {
  Array.from(board.children).forEach(cell => {
    cell.textContent = '';
  });
  hidePopup();
  status.textContent = `You are Player ${symbol}`;
});

socket.on('full', msg => {
  status.textContent = msg;
});

function resetGame() {
  socket.emit('reset');
}

function checkWinner() {
  const cells = Array.from(board.children).map(cell => cell.textContent);
  const patterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let p of patterns) {
    const [a, b, c] = p;
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

function isDraw() {
  const cells = Array.from(board.children).map(cell => cell.textContent);
  return cells.every(cell => cell !== '') && !checkWinner();
}

// 🎉 Popups
function showPopup(message) {
  popup.innerHTML = message;
  popup.classList.add('show');
}

function hidePopup() {
  popup.classList.remove('show');
}
