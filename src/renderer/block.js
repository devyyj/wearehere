import setImagePath from './image'

// ! 현재는 이미지 1개만 처리하여 그린다.
// ! 2개 이상의 이미지도 처리할 수 있도록 수정해야 한다.

class Block {
  x
  y
  shape
  ctx

  constructor(ctx, x, y, color, imagePath) {
    this.ctx = ctx
    this.spawn()

    // Starting position.
    this.x = x
    this.y = y

    this.color = color
    this.image = setImagePath(imagePath)
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
      row.forEach(async (value, x) => {
        // this.x, this.y는 shape의 상단 왼쪽 좌표이다
        // shape 안에 있는 블록 좌표에 x, y를 더한다.
        // 보드에서 블록의 좌표는 this.x + x가 된다.
        if (value > 0) {
          if (this.image.length)
            this.ctx.drawImage(this.image[0], this.x + x, this.y + y, 1, 1)
          else this.ctx.fillRect(this.x + x, this.y + y, 1, 1)
        }
      })
    })
  }

  clear() {
    this.shape.forEach((row, y) => {
      row.forEach(async (value, x) => {
        // this.x, this.y는 shape의 상단 왼쪽 좌표이다
        // shape 안에 있는 블록 좌표에 x, y를 더한다.
        // 보드에서 블록의 좌표는 this.x + x가 된다.
        if (value > 0) {
          this.ctx.clearRect(this.x + x, this.y + y, 1, 1)
        }
      })
    })
  }

  move(reverse = false) {
    if (reverse) this.y -= 1
    else this.y += 1
  }

  backMove(reverse = false) {
    if (reverse) this.y += 1
    else this.y -= 1
  }
}

export default Block
