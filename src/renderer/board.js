/**
 * -2 : 쌓인 블럭 값
 * -1 : 종료 효과를 위한 값
 */

class Board {
  constructor(rows, cols, color, imagePath) {
    this.board
    this.rows = rows
    this.cols = cols
    this.block
    this.ctx
    this.color = color
    this.image = imagePath
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

  valid(reverse = false) {
    return this.block.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = this.block.x + dx
        let y = this.block.y + dy
        if (reverse) y -= 1
        else y += 1
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

  endBoard(size, endColor){
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        // 스테이지가 종료되면 한줄씩 지운다.
        if (value === -1) {
          this.ctx.fillStyle = endColor
          this.ctx.fillRect(x * size, y * size, size + 1, size + 1)
        }
      })
    })
  }

  isFullRow(reverse = false) {
    if (reverse) return this.board[this.rows - 1].every((x) => x !== 0)
    else return this.board[0].every((x) => x !== 0)
  }

  // 배열의 값을 -1 로 설정한다.
  setEndRow(index, reverse) {
    if (!reverse) this.board[index] = this.board[index].map((x) => (x = -1))
    else
      this.board[this.board.length - index - 1] = this.board[
        this.board.length - index - 1
      ].map((x) => (x = -1))
  }

  // reverse === true 일때 y에 +1을 하지 않으면
  // bottom canvas 제일 마지막 줄이 채워지지 않는다. -> 스테이지가 끝나지 않음
  emptyCheck(p, reverse) {
    if (reverse) return this.board[p.y + 1][p.x] === 0
    else return this.board[p.y][p.x] === 0
  }
}

export default Board
