const gridElement = document.getElementById('grid');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('startButton');
const SIZE = 10;
const OBSTACLES = 15; // Número de obstáculos
const ENERGY_POSITIONS = [
    { pos: [2, 2], points: 5 },
    { pos: [4, 5], points: 5 },
    { pos: [6, 8], points: 5 },
    { pos: [3, 7], points: 10 },
    { pos: [8, 3], points: 10 }
];

let grid = Array.from({ length: SIZE }, () => Array(SIZE).fill('clear'));
let robot = { x: 0, y: 0, energy: 50 };

// Função para gerar o labirinto
function generateMaze() {
    for (let i = 0; i < OBSTACLES; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * SIZE);
            y = Math.floor(Math.random() * SIZE);
        } while ((x === 0 && y === 0) || (x === SIZE - 1 && y === SIZE - 1) || grid[x][y] === 'obstacle');
        grid[x][y] = 'obstacle';
    }

    ENERGY_POSITIONS.forEach(({ pos, points }) => {
        grid[pos[0]][pos[1]] = 'energy';
    });
}

// Função para desenhar o labirinto
function drawMaze() {
    gridElement.innerHTML = '';
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${ grid[i][j] }`;
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

// Implementação simplificada da busca em largura
function bfs() {
    const queue = [{ x: robot.x, y: robot.y, energy: robot.energy }];
    const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    visited[robot.x][robot.y] = true;

    while (queue.length > 0) {
        const current = queue.shift();
        const { x, y, energy } = current;

        // Verifica se chegou à saída
        if (x === SIZE - 1 && y === SIZE - 1) {
            statusElement.innerText = 'Chegada na saída!';
            return;
        }

        // Movimentos possíveis
        const directions = [
            { dx: -1, dy: 0 }, // Cima
            { dx: 1, dy: 0 },  // Baixo
            { dx: 0, dy: 1 },  // Direita
            { dx: 0, dy: -1 }  // Esquerda
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && !visited[nx][ny]) {
                if (grid[nx][ny] === 'obstacle') continue;

                let newEnergy = energy - 1;
                if (grid[nx][ny] === 'energy') {
                    newEnergy += (grid[nx][ny] === 'energy' && grid[nx][ny] === 'energy') ? 5 : 0;
                }

                if (newEnergy >= 0) {
                    queue.push({ x: nx, y: ny, energy: newEnergy });
                    visited[nx][ny] = true;
                }
            }
        }
    }

    statusElement.innerText = 'Sem energia! O robô não conseguiu chegar à saída.';
}

// Inicia a simulação
startButton.addEventListener('click', () => {
    generateMaze();
    drawMaze();
    bfs();
});