const cnv = document.getElementById("cnv");
const ctx = cnv.getContext("2d");
cnv.width = 800;
cnv.height = 800;

let startBtn = document.getElementById("start");
let pauseBtn = document.getElementById("pause");

let interval;
let paused;
const startAuto = false;
const intervalDelay = 1;

let path = [];
document.addEventListener("mousedown", createWall);

if (startAuto) {
  startBtn.innerHTML = "Pause";
  interval = setInterval(search, intervalDelay);
  paused = false;
} else {
  startBtn.innerHTML = "Start";
  paused = true;
}

startBtn.addEventListener("click", () => {
  if (paused) {
    startBtn.innerHTML = "Pause";
    interval = setInterval(search, intervalDelay);
    paused = false;
  } else {
    startBtn.innerHTML = "Unpause";
    clearInterval(interval);
    paused = true;
  }
});

let openSet = [];
let closedSet = [];
let walls = [];
let start;
let end;
const cols = 10;
const rows = 10;
let size = 80;
let done = false;

class Cell {
  constructor(i, j) {
    this.x = i;
    this.y = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbours = [];
    this.neighbours1 = [];
    this.color = "white";
    this.isWall = false;
    this.parent;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * size, this.y * size, size, size);

    ctx.fillStyle = "black";

    const textf = this.f.toFixed(2);
    const textg = this.g.toFixed(2);
    const texth = this.h.toFixed(2);
    ctx.fillText(textf, this.x * size + 30, this.y * size + 20);
    ctx.fillText(textg, this.x * size + 30, this.y * size + 40);
    ctx.fillText(texth, this.x * size + 30, this.y * size + 60);
  }
  addNeighbours() {
    const array = grid.flat(1).map((cell) => JSON.stringify([cell.x, cell.y]));
    const closedSetStr = closedSet.map((cell) => JSON.stringify([cell.x, cell.y]));
    const openSetStr = openSet.map((cell) => JSON.stringify([cell.x, cell.y]));

    let lneighbour = `[${this.x - 1},${this.y}]`;
    let rneighbour = `[${this.x + 1},${this.y}]`;
    let tneighbour = `[${this.x},${this.y - 1}]`;
    let bneighbour = `[${this.x},${this.y + 1}]`;

    checkNeighbour(lneighbour, this);
    checkNeighbour(rneighbour, this);
    checkNeighbour(tneighbour, this);
    checkNeighbour(bneighbour, this);

    this.neighbours.forEach((neighbour) => {
      grid.flat(1)[neighbour].parent = this;
    });

    function checkNeighbour(neighbour, cell) {
      const index = array.indexOf(neighbour);

      if (
        index != -1 &&
        !closedSetStr.includes(neighbour) &&
        !openSetStr.includes(neighbour) &&
        !grid.flat(1)[index].isWall
      ) {
        cell.neighbours.push(index);
      }
    }

    const up = { row: this.x, col: this.y - 1 };
    const down = { row: this.x, col: this.y + 1 };
    const left = { row: this.x - 1, col: this.y };
    const right = { row: this.x + 1, col: this.y };

    if (grid[up.row] && grid[up.row][up.col]) this.neighbours1.push(up);
    if (grid[down.row] && grid[down.row][down.col]) this.neighbours1.push(down);
    if (grid[left.row] && grid[left.row][left.col]) this.neighbours1.push(left);
    if (grid[right.row] && grid[right.row][right.col]) this.neighbours1.push(right);
  }
  makeWall() {
    this.isWall = true;
    this.color = "black";
  }
  removeWall() {
    this.isWall = false;
    this.color = "white";
  }
}

let grid = [];
for (let i = 0; i < cols; i++) {
  grid.push(new Array());
  for (let j = 0; j < rows; j++) {
    grid[i].push(new Cell(i, j));
  }
}

end = grid[cols - 1][rows - 1];
start = grid[0][0];
start.g = 0;
start.f = Math.sqrt(end.x ** 2 + end.y ** 2);
openSet.push(start);

let num = 0;

function search() {
  if (openSet.length > 0) {
    let winner = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    let current = openSet[winner];
    if (current == end) {
      let parent = current;
      for (let i = 0; i <= current.g; i++) {
        path.push(parent);
        parent = parent.parent;
      }
      console.log(path);
      clearInterval(interval);
      done = true;
    } else {
      current.addNeighbours();
      for (let i = 0; i < current.neighbours.length; i++) {
        const neighbour = grid.flat(1)[current.neighbours[i]];

        const neighbourI = current.neighbours1[i];
        const neighbour1 = grid[neighbourI.col][neighbourI.row];

        openSet.push(neighbour);
        neighbour.color = "green";
        neighbour.h = Math.sqrt((neighbour.x - end.x) ** 2 + (neighbour.y - end.y) ** 2);
        // neighbour.h = Math.abs(end.x - neighbour.x) + Math.abs(end.y - neighbour.y);
        neighbour.g = current.g + 1;
        neighbour.f = neighbour.g + neighbour.h;
      }
    }
    openSet.splice(winner, 1);
    closedSet.push(current);
    current.color = "red";
  } else {
    console.log("No solution");
    clearInterval(interval);
  }
}

requestAnimationFrame(loop);

function createWall(event) {
  let mouseX = (event.x - cnv.getBoundingClientRect().x) / size;
  let mouseY = (event.y - cnv.getBoundingClientRect().y) / size;

  let colI = Math.floor(mouseY % size);
  let rowI = Math.floor(mouseX % size);

  if (grid[rowI] && grid[rowI][colI]) {
    const wall = grid[rowI][colI];

    if (wall.isWall) {
      wall.removeWall();
    } else {
      wall.makeWall();
    }
  }
}

function loop() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      grid[i][j].draw();
    }
  }
  for (let i = 0; i < cnv.width; i += size) {
    for (let j = 0; j < cnv.height; j += size) {
      ctx.strokeRect(i, j, size, size);
    }
  }

  if (done) {
    ctx.fillStyle = "blue";
    for (let i = 0; i < path.length; i++) {
      ctx.fillRect(path[i].x * size, path[i].y * size, size, size);
    }
  }

  requestAnimationFrame(loop);
}
