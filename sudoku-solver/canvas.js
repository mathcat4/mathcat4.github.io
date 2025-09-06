let size, gridSize, sqSize;

let selected = false;
let selectedInd = 0;

let illegalInds = [];

let heldKey = null;
let heldFrames = 0;
const SPACE = 32;

let graph;

const COLOR = {
  foreground: "#ffffff",
  background: "#0a0f0f",
  lightblue: "#9696ff",
  darkblue1: "rgba(20, 50, 130, 0.2)",
  darkblue2: "rgba(20, 50, 130, 0.8)",
  red: "rgba(130, 50, 20, 0.8)",
};

let mSudoku, sudokuCanvas;

// Game loop

function setup() {
  resizeVars();
  sudokuCanvas = createCanvas(gridSize, gridSize);
  sudokuCanvas.parent("sudokuDiv");
  sudokuCanvas.id("sudoku");

  mSudoku = initSudoku();
  graph = getGraph();
}

function draw() {
  background(COLOR.background);
  checkKeyDown();

  [onGrid, curInd] = getSquare([mouseX, mouseY]);
  if (onGrid) {
    highlightSquare(curInd, COLOR.darkblue1);
  }

  if (selected) {
    illegalInds = [];
    highlightSquare(selectedInd, COLOR.darkblue2);
  }

  illegalInds.forEach((ind) => {
    highlightSquare(ind, COLOR.red);
  });

  drawSudoku();
}

// Helpers

function resizeVars() {
  const divWidth = document.getElementById("sudokuDiv").clientWidth;
  const divHeight = document.getElementById("sudokuDiv").clientHeight;
  gridSize = min(divWidth, divHeight);
  sqSize = gridSize / 9;
}

function drawSudoku() {
  stroke(COLOR.foreground);

  for (let i = 0; i <= 9; i++) {
    if (i % 3 == 0) {
      strokeWeight(3);
    } else {
      strokeWeight(1.5);
    }
    line(0, i * sqSize, gridSize, i * sqSize);
    line(i * sqSize, 0, i * sqSize, gridSize);
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (mSudoku[toInd(row, col)] != 0) {
        strokeWeight(0);
        fill(COLOR.foreground);
        textSize(0.65 * sqSize);
        textAlign(CENTER, CENTER);
        text(
          mSudoku[toInd(row, col)].toString(),
          sqSize * (col + 1 / 2),
          sqSize * (row + 1 / 2)
        );
      }
    }
  }
}

function highlightSquare(ind, col) {
  const cor = toCor(ind);
  fill(col);
  strokeWeight(0);
  square(sqSize * cor[1], sqSize * cor[0], sqSize);
}

function getSquare(pos) {
  let nx = pos[0] - 0;
  let ny = pos[1] - 0;
  if (!(0 <= nx && nx <= gridSize && 0 <= ny && ny <= gridSize)) {
    return [false, [0, 0]];
  }
  return [true, toInd(floor(ny / sqSize), floor(nx / sqSize))];
}

function checkKeyDown() {
  if (heldKey !== null && keyIsDown(heldKey)) {
    if (heldFrames > 15 && heldFrames % 5 == 0) {
      moveSelection(heldKey);
    }
    heldFrames++;
  } else {
    heldFrames = 0;
    heldKey = null;
  }

  for (let curKey of [
    UP_ARROW,
    RIGHT_ARROW,
    DOWN_ARROW,
    LEFT_ARROW,
    ENTER,
    SPACE,
  ]) {
    if (keyIsDown(curKey) && heldFrames == 0 && heldKey != curKey) {
      heldKey = curKey;
      moveSelection(heldKey);
      continue;
    }
  }
}

function moveSelection(curKeyCode) {
  if (curKeyCode == UP_ARROW) {
    selectedInd = max(selectedInd - 9, selectedInd % 9);
  } else if ([RIGHT_ARROW, ENTER, SPACE].includes(curKeyCode)) {
    selectedInd = min(selectedInd + 1, 80);
  } else if (curKeyCode == DOWN_ARROW) {
    selectedInd = min(selectedInd + 9, (selectedInd % 9) + 72);
  } else if (curKeyCode == LEFT_ARROW) {
    selectedInd = max(0, selectedInd - 1);
  }
}

// Events

function windowResized() {
  resizeVars();
  resizeCanvas(gridSize, gridSize);
}

function mouseClicked() {
  [selected, selectedInd] = getSquare([mouseX, mouseY]);
}

function keyPressed() {
  if (selected) {
    if ("123456789".includes(key)) {
      mSudoku[selectedInd] = Number(key);
    } else if (keyCode == BACKSPACE || keyCode == DELETE) {
      mSudoku[selectedInd] = 0;
    }
  }
}

function solveButton() {
  [verify, inds] = verifySudoku(mSudoku, graph);
  if (verify) {
    [valid, mSudoku] = solve(mSudoku, graph);
    if (!valid) {
      illegalInds = [...Array(81).keys()];
    }
  } else {
    illegalInds = inds;
  }
}
