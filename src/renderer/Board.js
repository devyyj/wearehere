class Board {
  constructor(ROWS, COLS) {
    this.grid
    this.ROWS = ROWS
    this.COLS = COLS
  }

  // 새 게임이 시작되면 보드를 초기화한다.
  reset() {
    this.grid = this.getEmptyBoard()
  }

  // 0으로 채워진 행렬을 얻는다.
  getEmptyBoard() {
      console.log(this.ROWS);
    return Array.from({length: this.ROWS}, () => Array(this.COLS).fill(0))
  }
}

export default Board
