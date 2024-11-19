// Seletores de elementos HTML
const gridElement = document.getElementById('grid');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('startButton');

// Configurações do labirinto
const SIZE = 10;
const OBSTACLES = 15;
const ENERGY_COUNT = 5;

class Cell {
    constructor(type = 'clear') {
        this.type = type;
    }

    isObstacle() {
        return this.type === 'obstacle';
    }

    isEnergy() {
        return this.type === 'energy';
    }
}

class Robot {
    constructor(x = 0, y = 0, energy = 50) {
        this.x = x;
        this.y = y;
        this.energy = energy;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.energy--;
    }

    collectEnergy() {
        this.energy += 5;
    }
}

class Maze {
    constructor(size, obstacles, energyCount) {
        this.size = size;
        this.grid = this.createEmptyGrid();
        this.robot = new Robot();
        this.generateObstacles(obstacles);
        this.generateEnergyCells(energyCount);
        this.ensureRobotCanMove(); // Garante que o robô não fique cercado
        this.ensurePathExists();  // Garante que a saída esteja acessível
    }

    createEmptyGrid() {
        return Array.from({ length: this.size }, () => Array(this.size).fill().map(() => new Cell()));
    }

    generateObstacles(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.size);
                y = Math.floor(Math.random() * this.size);
            } while (this.isStartOrEnd(x, y) || this.grid[x][y].isObstacle());
            this.grid[x][y] = new Cell('obstacle');
        }
    }

    generateEnergyCells(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.size);
                y = Math.floor(Math.random() * this.size);
            } while (this.isStartOrEnd(x, y) || this.grid[x][y].type !== 'clear');
            this.grid[x][y] = new Cell('energy');
        }
    }

    isStartOrEnd(x, y) {
        return (x === 0 && y === 0) || (x === this.size - 1 && y === this.size - 1);
    }

    ensureRobotCanMove() {
        // Garante que pelo menos uma célula adjacente à posição inicial esteja livre
        const adjacentCells = [
            { x: 0, y: 1 }, // Direita
            { x: 1, y: 0 }  // Abaixo
        ];

        let hasPath = adjacentCells.some(({ x, y }) =>
            x < this.size && y < this.size && this.grid[x][y].type !== 'obstacle'
        );

        // Se todas as células adjacentes forem obstáculos, libera uma aleatoriamente
        if (!hasPath) {
            const cellToClear = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
            if (cellToClear.x < this.size && cellToClear.y < this.size) {
                this.grid[cellToClear.x][cellToClear.y] = new Cell('clear');
            }
        }
    }

    ensurePathExists() {
        // Verifica se existe um caminho entre a posição inicial e a saída
        const visited = Array.from({ length: this.size }, () => Array(this.size).fill(false));
        const queue = [{ x: 0, y: 0 }];

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            if (x === this.size - 1 && y === this.size - 1) {
                // Caminho encontrado, saída não está bloqueada
                return;
            }

            const directions = [
                { dx: -1, dy: 0 }, // cima
                { dx: 1, dy: 0 },  // baixo
                { dx: 0, dy: 1 },  // direita
                { dx: 0, dy: -1 }  // esquerda
            ];

            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size && !visited[nx][ny] && this.grid[nx][ny].type !== 'obstacle') {
                    visited[nx][ny] = true;
                    queue.push({ x: nx, y: ny });
                }
            }
        }

        // Se não encontrou um caminho, reposiciona obstáculos ou libera um caminho
        // Aqui você pode gerar um novo labirinto ou tentar remover/realocar obstáculos.
        console.log("Saída bloqueada, ajustando labirinto...");
        this.generateObstacles(OBSTACLES);  // Regenerando obstáculos
        this.ensurePathExists();  // Chama recursivamente para tentar garantir um caminho
    }

    draw(robot) {
        gridElement.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = `cell ${this.grid[i][j].type}`;
                if (this.grid[i][j].isEnergy()) {
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
}


class Game {
    constructor(size, obstacles, energyCount) {
        this.maze = new Maze(size, obstacles, energyCount);
    }

    bfs() {
        const queue = [{ x: this.maze.robot.x, y: this.maze.robot.y, energy: this.maze.robot.energy, path: [] }];
        const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
        visited[this.maze.robot.x][this.maze.robot.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y, energy, path } = current;

            // Verifica se chegou na saída
            if (x === SIZE - 1 && y === SIZE - 1) {
                statusElement.innerText = 'Chegada na saída!';
                this.animatePath([...path, { x, y }]);
                return;
            }

            const directions = [
                { dx: -1, dy: 0 }, // cima
                { dx: 1, dy: 0 },  // baixo
                { dx: 0, dy: 1 },  // direita
                { dx: 0, dy: -1 }  // esquerda
            ];

            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && !visited[nx][ny]) {
                    if (this.maze.grid[nx][ny].isObstacle()) continue;

                    let newEnergy = energy - 1;
                    if (this.maze.grid[nx][ny].isEnergy()) {
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

    animatePath(path) {
        let step = 0;
        const interval = setInterval(() => {
            if (step >= path.length) {
                clearInterval(interval);
                return;
            }
            const { x, y } = path[step];
            this.maze.robot.x = x;
            this.maze.robot.y = y;
            this.maze.draw(this.maze.robot);
            step++;
        }, 200);
    }

    start() {
        this.maze = new Maze(SIZE, OBSTACLES, ENERGY_COUNT);
        this.maze.draw(this.maze.robot);
        this.bfs();
    }
}

// Inicializa o jogo ao clicar no botão "Start"
const game = new Game(SIZE, OBSTACLES, ENERGY_COUNT);
startButton.addEventListener('click', () => game.start());
