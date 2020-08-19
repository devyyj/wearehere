class Board {
  constructor(rows, cols) {
    this.grid
    this.rows = rows
    this.cols = cols
    this.block
    this.ctx
  }

  // 새 게임이 시작되면 보드를 초기화한다.
  reset() {
    this.grid = this.getEmptyBoard()
  }

  // 0으로 채워진 행렬을 얻는다.
  getEmptyBoard() {
    // console.log(this.rows);
    return Array.from({length: this.rows}, () => Array(this.cols).fill(0))
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx
        let y = p.y + dy
        return (
          value === 0 ||
          (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
        )
      })
    })
  }

  insideWalls(x) {
    return x >= 0 && x < this.cols
  }

  aboveFloor(y) {
    return y <= this.rows
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0
  }

  freeze() {
    this.block.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.block.y][x + this.block.x] = value
        }
      })
    })
  }

  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = 'red';
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }
}

export default Board
