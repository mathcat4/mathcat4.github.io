function initSudoku() {
  return new Array(81).fill(0);
}

function exportSudoku(sudoku) {
  return sudoku.join("");
}

function importSudoku(encoded) {
  const sudoku = initSudoku();
  if (!/^\d+$/.test(encoded) || encoded.length != 81) {
    console.error("Invalid sudoku string");
  } else {
    for (let ind = 0; ind < 81; ind++) {
      sudoku[ind] = Number(encoded[ind]);
    }
  }
  return sudoku;
}

function toInd(row, col) {
  return 9 * row + col;
}

function toCor(ind) {
  return [Math.floor(ind / 9), ind % 9];
}

function getGraph() {
  const graph = new Map();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const neighbours = new Set();
      for (let i = 0; i < 9; i++) {
        neighbours.add(toInd(i, col));
        neighbours.add(toInd(row, i));
      }

      const mRow = Math.floor(row / 3) * 3 + 1;
      const mCol = Math.floor(col / 3) * 3 + 1;
      for (let dRow of [-1, 0, 1]) {
        for (let dCol of [-1, 0, 1]) {
          neighbours.add(toInd(mRow + dRow, mCol + dCol));
        }
      }
      neighbours.delete(toInd(row, col));
      graph.set(toInd(row, col), neighbours);
    }
  }
  return graph;
}

function getNeighbours(sudoku, ind, graph) {
  const neighbours = new Set([...graph.get(ind)].map((ind) => sudoku[ind]));
  neighbours.delete(0);
  return neighbours;
}

function solverDraw() {
  const [onGrid, curInd] = getSquare([mouseX, mouseY]);
  if (onGrid) {
    for (let ind of graph.get(curInd)) {
      highlightSquare(ind, color(0, 255, 0, 150));
    }
  }
}

function verifySudoku(sudoku, graph) {
  let illegal = [];
  for (let ind = 0; ind < 81; ind++) {
    if (getNeighbours(sudoku, ind, graph).has(sudoku[ind])) {
      illegal.push(ind);
    }
  }
  return [illegal.length == 0, illegal];
}

function printSudoku(sudoku) {
  let string = sudoku
    .join(" ")
    .match(/.{1,18}/g)
    .join("\n");
  console.log(string);
}

function solve(sudoku, graph) {
  let sInds = [];
  for (let ind = 0; ind < 81; ind++) {
    if (sudoku[ind] == 0) {
      sInds.push([getNeighbours(sudoku, ind, graph), ind]);
    }
  }
  if (sInds.length == 0) {
    return [true, sudoku];
  }
  let [neighbours, sInd] = sInds.sort((a, b) => b[0].size - a[0].size)[0];

  const allNums = new Set(Array.from(new Array(9), (_, i) => i + 1));

  for (let nNum of allNums.difference(neighbours)) {
    let nSudoku = sudoku.slice(0);
    nSudoku[sInd] = nNum;

    let [valid, solSudoku] = solve(nSudoku, graph);
    if (valid) {
      return [true, solSudoku];
    }
  }
  return [false, sudoku];
}

// testEncoded = "000000000600009100007005002008002009006090030000340000100504020500006007400000003";
// testSudoku = importSudoku(testEncoded);
