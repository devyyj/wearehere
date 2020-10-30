class Block {
  x
  y
  shape
  ctx

  constructor(ctx, x, y, color, imagePath) {
    this.ctx = ctx

    // Starting position.
    this.x = x
    this.y = y

    this.color = color
    this.image = imagePath

    this.spawn()

    this.angle = 1
  }

  // 이미지를 선택했다면 이미지 배열의 인덱스 + 1의 값으로 블럭을 설정한다.
  // 블럭을 그리는 조건이 value > 0 이고, 배열의 인덱스는 0을 값으로 가질 수 있기 때문에 + 1을 해준다.
  // 이미지를 그릴때는 인덱스 - 1의 값을 사용한다.
  randomImage() {
    return (parseInt(Math.random() * 10) % this.image.length) + 1
  }

  spawn() {
    if (this.image.length) {
      this.shape = [
        [this.randomImage(), this.randomImage()],
        [this.randomImage(), this.randomImage()],
      ]
    } else {
      this.shape = [
        [1, 1],
        [1, 1],
      ]
    }
  }

  draw(size, grid, spin) {
    this.ctx.fillStyle = this.color
    this.shape.forEach((row, y) => {
      row.forEach(async (value, x) => {
        // this.x, this.y는 shape의 상단 왼쪽 좌표이다
        // shape 안에 있는 블록 좌표에 x, y를 더한다.
        // 보드에서 블록의 좌표는 this.x + x가 된다.
        if (value > 0) {
          if (this.image.length) {
            if (spin) {
              // todo
            } else {
              // 이미지를 그리고
              this.ctx.drawImage(
                this.image[value - 1],
                (this.x + x) * size,
                (this.y + y) * size,
                size,
                size,
              )
            }
            // 이미지 위에 그리드를 그린다
            if (grid) {
              this.ctx.strokeRect(
                (this.x + x) * size + 0.5,
                (this.y + y) * size + 0.5,
                size,
                size,
              )
            }
          } else {
            // 블럭을 그리고
            this.ctx.fillRect(
              (this.x + x) * size,
              (this.y + y) * size,
              size,
              size,
            )
            // 블럭 위에 그리드를 그린다
            if (grid) {
              this.ctx.strokeRect(
                (this.x + x) * size + 0.5,
                (this.y + y) * size + 0.5,
                size,
                size,
              )
            }
          }
        }
      })
    })
  }

  clear(size, grid = true) {
    this.shape.forEach((row, y) => {
      row.forEach(async (value, x) => {
        // this.x, this.y는 shape의 상단 왼쪽 좌표이다
        // shape 안에 있는 블록 좌표에 x, y를 더한다.
        // 보드에서 블록의 좌표는 this.x + x가 된다.
        if (value > 0) {
          // 블럭을 지우고
          this.ctx.clearRect(
            (this.x + x) * size,
            (this.y + y) * size,
            size,
            size,
          )
          // 지운 자리에 그리드를 그린다
          if (grid) {
            this.ctx.strokeRect(
              (this.x + x) * size + 0.5,
              (this.y + y) * size + 0.5,
              size,
              size,
            )
          }
        }
      })
    })
  }

  move(reverse = false) {
    if (reverse) this.y -= 1
    else this.y += 1
  }

  spin() {
    let temp = this.shape[1][0]
    this.shape[1][0] = this.shape[1][1]
    this.shape[1][1] = this.shape[0][1]
    this.shape[0][1] = this.shape[0][0]
    this.shape[0][0] = temp
  }
}

export default Block
