const gridElement = document.getElementById('grid');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('startButton');
const SIZE = 10;
const OBSTACLES = 15;
const ENERGY_COUNT = 5; // Número total de posições de energia

let grid = Array.from({ length: SIZE }, () => Array(SIZE).fill('clear'));
let robot = { x: 0, y: 0, energy: 50 };

function generateMaze() {
    // Limpa o labirinto e reinicia as posições do robô e obstáculos
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill('clear'));
    robot = { x: 0, y: 0, energy: 50 };

    // Gera obstáculos
    for (let i = 0; i < OBSTACLES; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * SIZE);
            y = Math.floor(Math.random() * SIZE);
        } while ((x === 0 && y === 0) || (x === SIZE - 1 && y === SIZE - 1) || grid[x][y] === 'obstacle');
        grid[x][y] = 'obstacle';
    }

    // Gera posições de energia aleatoriamente
    for (let i = 0; i < ENERGY_COUNT; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * SIZE);
            y = Math.floor(Math.random() * SIZE);
        } while ((x === 0 && y === 0) || (x === SIZE - 1 && y === SIZE - 1) || grid[x][y] !== 'clear');
        grid[x][y] = 'energy';
    }
}

function drawMaze() {
    gridElement.innerHTML = '';
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${grid[i][j]}`;
            if (grid[i][j] === 'energy') {
                cell.innerText = '+5';
            }
            if (i === robot.x && j === robot.y) {
                cell.classList.add('robot');
                cell.innerText = 'R';
            }
            gridElement.appendChild(cell);
        }
    }
}

function bfs() {
    const queue = [{ x: robot.x, y: robot.y, energy: robot.energy, path: [] }];
    const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    visited[robot.x][robot.y] = true;

    while (queue.length > 0) {
        const current = queue.shift();
        const { x, y, energy, path } = current;

        if (x === SIZE - 1 && y === SIZE - 1) {
            statusElement.innerText = 'Chegada na saída!';
            animatePath([...path, { x, y }]);
            return;
        }

        const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && !visited[nx][ny]) {
                if (grid[nx][ny] === 'obstacle') continue;

                let newEnergy = energy - 1;
                if (grid[nx][ny] === 'energy') {
                    newEnergy += 5;
                }

                if (newEnergy >= 0) {
                    queue.push({ x: nx, y: ny, energy: newEnergy, path: [...path, { x, y }] });
                    visited[nx][ny] = true;
                }
            }
        }
    }

    statusElement.innerText = 'Sem energia! O robô não conseguiu chegar à saída.';
}

function animatePath(path) {
    let step = 0;
    const interval = setInterval(() => {
        if (step >= path.length) {
            clearInterval(interval);
            return;
        }
        const { x, y } = path[step];
        robot.x = x;
        robot.y = y;
        drawMaze();
        step++;
    }, 200);
}

startButton.addEventListener('click', () => {
    generateMaze();
    drawMaze();
    bfs();
});