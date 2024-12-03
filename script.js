const gridElement = document.getElementById('grid');
const statusElement = document.getElementById('status');
const energyElement = document.getElementById('energy');
const startButton = document.getElementById('startButton');

const SIZE = 10;
const MIN_OBSTACLES = 10;
const MAX_OBSTACLES = 25;
const ENERGY_SPOTS_5 = 5;
const ENERGY_SPOTS_10 = 3;

class Cell {
    constructor(type = 'clear', energyValue = 0) {
        this.type = type;
        this.energyValue = energyValue;
    }

    isObstacle() {
        return this.type === 'obstacle';
    }

    isEnergy() {
        return this.type === 'energy-5' || this.type === 'energy-10';
    }
}

class Robot {
    constructor(x = 0, y = 0, energy = 50) {
        this.x = x;
        this.y = y;
        this.energy = energy;
        this.initialEnergy = energy;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.energy--;
        this.updateEnergyDisplay();
    }

    collectEnergy(value) {
        this.energy += value;
        this.updateEnergyDisplay();
    }

    updateEnergyDisplay() {
        energyElement.textContent = this.energy;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.energy = this.initialEnergy;
        this.updateEnergyDisplay();
    }
}

class Maze {
    constructor(size) {
        this.size = size;
        this.grid = this.createEmptyGrid();
        this.robot = new Robot();
        
        const obstacleCount = Math.floor(Math.random() * (MAX_OBSTACLES - MIN_OBSTACLES + 1)) + MIN_OBSTACLES;
        
        this.generateObstacles(obstacleCount);
        this.generateEnergyCells(ENERGY_SPOTS_5, 5);
        this.generateEnergyCells(ENERGY_SPOTS_10, 10);
        this.ensureValidPath();
    }

    createEmptyGrid() {
        return Array.from({ length: this.size }, () => 
            Array(this.size).fill().map(() => new Cell())
        );
    }


    generateObstacles(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.size);
                y = Math.floor(Math.random() * this.size);
            } while (this.isStartOrEnd(x, y) || this.grid[x][y].type !== 'clear');
            this.grid[x][y] = new Cell('obstacle');
        }
    }

    generateEnergyCells(count, energyValue) {
        const type = energyValue === 5 ? 'energy-5' : 'energy-10';
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.size);
                y = Math.floor(Math.random() * this.size);
            } while (this.isStartOrEnd(x, y) || this.grid[x][y].type !== 'clear');
            this.grid[x][y] = new Cell(type, energyValue);
        }
    }

    isStartOrEnd(x, y) {
        return (x === 0 && y === 0) || (x === this.size - 1 && y === this.size - 1);
    }

    ensureValidPath() {
        this.grid[0][0] = new Cell('clear');
        this.grid[this.size - 1][this.size - 1] = new Cell('clear');
        
        if (!this.hasValidPath()) {
            this.grid = this.createEmptyGrid();
            const obstacleCount = Math.floor(Math.random() * (MAX_OBSTACLES - MIN_OBSTACLES + 1)) + MIN_OBSTACLES;
            this.generateObstacles(obstacleCount);
            this.generateEnergyCells(ENERGY_SPOTS_5, 5);
            this.generateEnergyCells(ENERGY_SPOTS_10, 10);
            this.ensureValidPath(); 
        }
    }

    hasValidPath() {
        const visited = Array.from({ length: this.size }, () => Array(this.size).fill(false));
        const queue = [{x: 0, y: 0}];
        visited[0][0] = true;

        while (queue.length > 0) {
            const {x, y} = queue.shift();
            if (x === this.size - 1 && y === this.size - 1) return true;

            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                if (this.isValidMove(newX, newY) && !visited[newX][newY] && !this.grid[newX][newY].isObstacle()) {
                    queue.push({x: newX, y: newY});
                    visited[newX][newY] = true;
                }
            }
        }
        return false;
    }

    isValidMove(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    draw() {
        gridElement.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = `cell ${this.grid[i][j].type}`;
                if (i === this.robot.x && j === this.robot.y) {
                    cell.classList.add('robot');
                    cell.innerText = 'R';
                }
                
                gridElement.appendChild(cell);
            }
        }
    }
}

class Game {
    constructor() {
        this.maze = new Maze(SIZE);
        this.isRunning = false;
    }

    async bfs() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const queue = [{
            x: 0,
            y: 0,
            energy: this.maze.robot.energy,
            path: []
        }];
        
        const visited = new Set();
        visited.add('0,0');

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y, energy, path } = current;

            if (energy <= 0) {
                continue;
            }

            if (x === SIZE - 1 && y === SIZE - 1) {
                statusElement.innerText = 'Chegada na saída!';
                await this.animatePath([...path, { x, y }]);
                this.isRunning = false;
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
                const key = `${nx},${ny}`;

                if (this.maze.isValidMove(nx, ny) && !visited.has(key) && !this.maze.grid[nx][ny].isObstacle()) {
                    let newEnergy = energy - 1;
                    if (this.maze.grid[nx][ny].isEnergy()) {
                        newEnergy += this.maze.grid[nx][ny].energyValue;
                    }

                    queue.push({
                        x: nx,
                        y: ny,
                        energy: newEnergy,
                        path: [...path, { x, y }]
                    });
                    visited.add(key);
                }
            }
        }

        statusElement.innerText = 'Sem energia! O robô não conseguiu chegar à saída.';
        this.isRunning = false;
    }

    async animatePath(path) {
        for (const position of path) {
            this.maze.robot.x = position.x;
            this.maze.robot.y = position.y;
            
            if (this.maze.grid[position.x][position.y].isEnergy()) {
                this.maze.robot.collectEnergy(this.maze.grid[position.x][position.y].energyValue);
                this.maze.grid[position.x][position.y] = new Cell('clear');
            } else {
                this.maze.robot.move(0, 0); 
            }
            
            this.maze.draw();
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    start() {
        if (this.isRunning) return;
        
        statusElement.innerText = 'Iniciando...';
        this.maze = new Maze(SIZE);
        this.maze.robot.reset();
        this.maze.draw();
        this.bfs();
    }
}

const game = new Game();
game.maze.draw();

startButton.addEventListener('click', () => game.start());