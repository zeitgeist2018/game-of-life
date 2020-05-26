window.addEventListener('load', init, false);
let canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d'),
    fps = 6,
    minFps = 0,
    maxFps = 30,
    cellSize = 10,
    timer,
    cells,
    bgColor = '#111',
    color = '#FAFAFA';
const speedSlider = document.getElementById('speed-slider');

speedSlider.oninput = v => {
    fps = v.target.value;
    clearInterval(timer);
    startLoop();
}
speedSlider.min = minFps;
speedSlider.max = maxFps;
speedSlider.value = fps;

const pauseBtn = document.getElementById('pause-btn');
let previousFps = fps;
pauseBtn.onclick = () => {
    clearInterval(timer);
    if (fps <= 0) {
        fps = previousFps
        pauseBtn.innerHTML = 'Pause';
        startLoop();
    } else {
        previousFps = fps;
        fps = 0;
        pauseBtn.innerHTML = 'Resume';
    }
    speedSlider.value = fps;
}

function getGridPositionFromCoordinates(posX, posY) {
    for (let row = 0; row < cells.length; row++) {
        for (let cell = 0; cell < cells[row].length; cell++) {
            const minX = cellSize * cell,
                maxX = (cellSize * cell) + cellSize - 1,
                minY = cellSize * row,
                maxY = (cellSize * row) + cellSize - 1;
            if (posX >= minX &&
                posX <= maxX &&
                posY >= minY &&
                posY <= maxY) {
                return {x: cell, y: row};
            }
        }
    }
}

let drawingEnabled = false;
canvas.onmousedown = e => {
    drawingEnabled = true;
}
canvas.onmouseup = e => {
    drawingEnabled = false;
}
canvas.onmousemove = e => {
    if (drawingEnabled) {
        let x;
        let y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        const gridClick = getGridPositionFromCoordinates(x, y);
        cells[gridClick.y][gridClick.x] = true;
        draw();
    }
}

function init() {
    canvas.height = Math.ceil((window.innerHeight * 0.85) / 20) * 20;
    canvas.width = Math.ceil((window.innerWidth * 0.95) / 20) * 20;
    initialiseCells();
    initGame();
}

function initialiseCells() {
    cells = [];
    const cols = canvas.width / cellSize;
    const rows = canvas.height / cellSize;
    for (let y = 0; y < rows; y++) {
        cells.push([]);
        for (let x = 0; x < cols; x++) {
            cells[y].push(false);
        }
    }
}

function initGame() {
    seed();
    startLoop();
}

function startLoop() {
    loop();
    if (fps > 0) {
        timer = setInterval(loop, 1000 / fps);
    }
}

function seed() {
    const centerRow = Math.round(cells.length / 2);
    const centerCell = Math.round(cells[0].length / 2);
    cells[centerRow - 1][centerCell - 1] = true;
    cells[centerRow - 1][centerCell] = true;
    cells[centerRow - 1][centerCell + 1] = true;
}

function loop() {
    draw();
    computeCells();
}

function draw() {
    drawBackground();
    drawCells();
    drawGrid();
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
            const xPos = cellSize * cell;
            const yPos = cellSize * row;
            ctx.fillRect(xPos, yPos, cellSize, cellSize);
        }
    }
}

function drawGrid() {
    ctx.fillStyle = '#222';
    const strokeSize = 1;
    // Vertical lines
    for (let i = 0; i < cells[0].length * cellSize; i += cellSize) {
        ctx.fillRect(i, 0, strokeSize, canvas.height);
    }
    // Horizontal lines
    for (let i = 0; i < cells.length * cellSize; i += cellSize) {
        ctx.fillRect(0, i, canvas.width, strokeSize);
    }
}

function drawBackground() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
