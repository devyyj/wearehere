class Block {
  x
  y
  shape
  ctx

  constructor(ctx, x, y, color = 'green') {
    this.ctx = ctx
    this.spawn()
    
    // Starting position.
    this.x = x
    this.y = y

    this.color = color
  }

  spawn() {
    this.shape = [
      [1, 1],
      [1, 1],
    ]
  }

  draw() {
    this.ctx.fillStyle = this.color
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        // this.x, this.y는 shape의 상단 왼쪽 좌표이다
        // shape 안에 있는 블록 좌표에 x, y를 더한다.
        // 보드에서 블록의 좌표는 this.x + x가 된다.
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1)
        }
      })
    })
  }

  move(p) {
    this.x = p.x
    this.y = p.y
  }
}

export default Block
