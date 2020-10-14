class Board {
  constructor(rows, cols, color = 'green') {
    this.board
    this.rows = rows
    this.cols = cols
    this.block
    this.ctx
    this.color = color
  }

  // 새 게임이 시작되면 보드를 초기화한다.
  reset() {
    this.board = this.getEmptyBoard()
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
    return this.board[y] && this.board[y][x] === 0
  }

  freeze() {
    this.block.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.block.y][x + this.block.x] = value
        }
      })
    })
  }

  drawBoard(isEnd = false, endColor) {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        // 블럭을 그린다.
        if (!isEnd && value > 0) {
          this.ctx.fillStyle = this.color
          this.ctx.fillRect(x, y, 1, 1)
        }
        // 스테이지가 종료되면 한줄씩 지운다.
        if (isEnd && value < 0) {
          this.ctx.fillStyle = endColor
          this.ctx.fillRect(x, y, 1.1, 1.1) // 1.1이 아닌 1로 설정하면 가장 오른쪽과 아래에 1픽셀씩 남는다.
        }
      })
    })
  }

  isFullRow(reverse = false) {
    if (reverse) return this.board[this.rows - 1].every((x) => x > 0)
    else return this.board[0].every((x) => x > 0)
  }

  // 배열의 값을 -1 로 설정한다.
  setEndRow(index, reverse) {
    if (!reverse) this.board[index] = this.board[index].map((x) => (x = -1))
    else
      this.board[this.board.length - index - 1] = this.board[
        this.board.length - index - 1
      ].map((x) => (x = -1))
  }
}

export default Board
