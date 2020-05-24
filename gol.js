window.addEventListener('load', init, false);
let canvas, ctx, timer, cellSize, cells = [];
const fps = 10, bgColor = '#111', color = '#FAFAFA';

function init() {
    canvas = document.getElementsByTagName('canvas')[0];
    ctx = canvas.getContext('2d');
    canvas.width = Math.round(window.innerWidth * 0.98);
    canvas.height = Math.round(window.innerHeight * 0.98);
    const resolution = 60;
    const cellWidth = Math.trunc(canvas.width / resolution);
    const cellHeight = Math.trunc(canvas.height / resolution);
    for (let x = 0; x < resolution; x++) {
        cells.push([]);
        for (let y = 0; y < resolution; y++) {
            cells[x].push(false);
        }
    }
    cellSize = {x: cellWidth, y: cellHeight}
    initGame();
}

function initGame() {
    seed();
    loop();
    timer = setInterval(loop, 1000 / fps);
}

function seed() {
    const centerRow = Math.round(cells.length / 2);
    const centerCell = Math.round(cells[0].length / 2);
    cells[centerRow - 1][centerCell - 1] = true;
    cells[centerRow - 1][centerCell] = true;
    cells[centerRow - 1][centerCell + 1] = true;
}

function loop() {
    drawBackground();
    drawCells();
    drawGrid();
    computeCells();
}

function getNeighbors(x, y) {
    const prevX = x - 1 < 0 ? cells[0].length - 1 : x - 1;
    const nextX = x + 1 > cells[0].length - 1 ? 0 : x + 1;
    const prevY = y - 1 < 0 ? cells.length - 1 : y - 1;
    const nextY = y + 1 > cells.length - 1 ? 0 : y + 1;

    const topLeft = cells[prevY][prevX];
    const top = cells[y][prevX];
    const topRight = cells[nextY][prevX];
    const left = cells[prevY][x];
    const right = cells[nextY][x];
    const bottomLeft = cells[prevY][nextX];
    const bottom = cells[y][nextX];
    const bottomRight = cells[nextY][nextX];
    const neighbors = [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight]
    if (x === 2 && y === 1) {
        console.log(prevX, nextX, prevY, nextY);
        console.log(neighbors);
    }
    // console.table(cells);
    // console.log(x, y, neighbors);
    // console.log(x, y);
    return neighbors.filter(n => n === true)
        .length
}

function computeCells() {
    const newCells = [];
    for (let row = 0; row < cells.length; row++) {
        newCells.push([]);
        for (let cell = 0; cell < cells[row].length; cell++) {
            const neighbors = getNeighbors(cell, row);
            const old = cells[row][cell];
            if (row === 1 && cell === 2) {
                console.log(neighbors);
            }
            if (old && (neighbors === 2 || neighbors === 3)) {
                newCells[row].push(true); // Survives
            } else if (!old && neighbors === 3) {
                newCells[row].push(true); // Born
            } else {
                newCells[row].push(false); // Dies
            }
        }
    }
    cells = newCells;
}

function drawCells() {
    for (let row = 0; row < cells.length; row++) {
        for (let cell = 0; cell < cells[row].length; cell++) {
            ctx.fillStyle = cells[row][cell] === true ? color : bgColor;
            const xPos = cellSize.x * cell;
            const yPos = cellSize.y * row;
            ctx.fillRect(xPos, yPos, cellSize.x, cellSize.y);
        }
    }
}

function drawGrid() {
    ctx.fillStyle = '#444';
    const strokeSize = 2;
    for (let i = 0; i < cells.length * cellSize.x; i += cellSize.x) {
        ctx.fillRect(i, 0, strokeSize, canvas.height);
    }
    for (let i = 0; i < cells[0].length * cellSize.y; i += cellSize.y) {
        ctx.fillRect(0, i, canvas.width, strokeSize);
    }
}

function drawBackground() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
