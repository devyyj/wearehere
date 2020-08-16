class Board {
  constructor(rows, cols) {
    this.grid;
    this.rows = rows;
    this.cols = cols;
  }

  // 새 게임이 시작되면 보드를 초기화한다.
  reset() {
    this.grid = this.getEmptyBoard();
  }

  // 0으로 채워진 행렬을 얻는다.
  getEmptyBoard() {
    console.log(this.rows);
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }
}

export default Board;
