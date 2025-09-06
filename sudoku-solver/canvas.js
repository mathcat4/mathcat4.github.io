let size, gridSize, sqSize;

let selected = false;
let selectedPos = [0, 0];

let heldKey = null;
let heldFrames = 0;
const SPACE = 32;

const COLOR = {
  foreground: "#ffffff",
  background: "#0a0f0f",
  lightblue: "#9696ff",
  darkblue1: "rgba(20, 50, 130, 0.2)",
  darkblue2: "rgba(20, 50, 130, 0.8)",
  // cDarkgreen1: (10, 70, 30),
  // cDarkgreen2: (10, 130, 30),
};

let sudoku, sudokuCanvas;

// Game loop

function setup() {
  resizeVars();
  sudokuCanvas = createCanvas(gridSize, gridSize);
  sudokuCanvas.parent("sudokuDiv");
  sudokuCanvas.id("sudoku");
  initSudoku();
}

function draw() {
  background(COLOR.background);
  checkKeyDown();

  [onGrid, curPos] = getSquare([mouseX, mouseY]);
  if (onGrid) {
    highlightSquare(curPos, COLOR.darkblue1);
  }

  if (selected) {
    highlightSquare(selectedPos, COLOR.darkblue2);
  }

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
      if (sudoku[row][col] != 0) {
        strokeWeight(0);
        fill(COLOR.foreground);
        textSize(0.8 * sqSize);
        textAlign(CENTER, CENTER);
        text(
          sudoku[row][col].toString(),
          sqSize * (col + 1 / 2),
          sqSize * (row + 1 / 2)
        );
      }
    }
  }
}

function highlightSquare(pos, col) {
  fill(col);
  strokeWeight(0);
  square(sqSize * pos[1], sqSize * pos[0], sqSize);
}

function getSquare(pos) {
  let nx = pos[0] - 0;
  let ny = pos[1] - 0;
  if (!(0 <= nx && nx <= gridSize && 0 <= ny && ny <= gridSize)) {
    return [false, [0, 0]];
  }
  return [true, [floor(ny / sqSize), floor(nx / sqSize)]];
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
  if (curKeyCode == UP_ARROW && selectedPos[0] > 0) {
    selectedPos[0]--;
  } else if ([RIGHT_ARROW, ENTER, SPACE].includes(curKeyCode)) {
    if (selectedPos[1] < 8) {
      selectedPos[1]++;
    } else if (selectedPos[0] < 8) {
      selectedPos = [selectedPos[0] + 1, 0];
    }
  } else if (curKeyCode == DOWN_ARROW && selectedPos[0] < 8) {
    selectedPos[0] = selectedPos[0] + 1;
  } else if (curKeyCode == LEFT_ARROW) {
    if (selectedPos[1] > 0) {
      selectedPos[1]--;
    } else if (selectedPos[0] > 0) {
      selectedPos = [selectedPos[0] - 1, 8];
    }
  }
}

function exportSudoku() {
  return sudoku.map((row) => row.join("")).join("");
}

function importSudoku(encoded) {
  if (!/^\d+$/.test(encoded) || encoded.length != 81) {
    console.error("Invalid sudoku string");
  } else {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        sudoku[row][col] = Number(encoded[9 * row + col]);
      }
    }
  }
}

function initSudoku() {
  sudoku = Array.from({ length: 9 }, () => Array(9).fill(0));
}

// Events

function windowResized() {
  resizeVars();
  resizeCanvas(gridSize, gridSize);
}

function mouseClicked() {
  [selected, selectedPos] = getSquare([mouseX, mouseY]);
}

function keyPressed() {
  if (selected) {
    if ("123456789".includes(key)) {
      sudoku[selectedPos[0]][selectedPos[1]] = Number(key);
    } else if (keyCode == BACKSPACE || keyCode == DELETE) {
      sudoku[selectedPos[0]][selectedPos[1]] = 0;
    }
  }
}
