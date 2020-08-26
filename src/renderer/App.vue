<template>
  <div id="app">
    <div id="main">
      <canvas id="top-board"></canvas><canvas id="bottom-board"></canvas>
    </div>
  </div>
</template>

<script>
  import Board from './board'
  import Block from './block'

  export default {
    name: 'wearehere',
    data() {
      return {
        topCtx: undefined,
        bottomCtx: undefined,
        topBoard: undefined,
        bottomBoard: undefined,
        config: {
          size: 0, // board 크기
          count: 80, // 한 줄당 block 수
        },
        isPause: false,
      }
    },
    computed: {
      blockSize() {
        return this.config.size / this.config.count
      },
    },
    created() {
      // resize 이벤트 리스너 등록
      window.addEventListener('resize', () => {
        this.config.size =
          parseInt(window.innerHeight / this.config.count) * this.config.count
        this.init('top')
        this.init('bottom', true)
      })

      // 키보드 이벤트 리스너 등록
      window.addEventListener('keydown', this.handleKey)
    },
    mounted() {
      // 초기화
      this.config.size =
        parseInt(window.innerHeight / this.config.count) * this.config.count
      const topCtx = document.getElementById('top-board').getContext('2d')
      const bottomCtx = document.getElementById('bottom-board').getContext('2d')

      this.topCtx = topCtx
      this.bottomCtx = bottomCtx

      this.initBoard('top')
      this.initBoard('bottom')

      this.init('top')
      this.init('bottom', true)

      // 위 아래 둘 중에 하나라도 게임이 오버되면 둘다 멈춘다.
      setInterval(() => {
        if (this.isPause) return
        this.down('top')
        this.down('bottom', true)
      }, 1)
    },
    methods: {
      init(position, reverse = false) {
        let ctx
        let board
        if (position === 'top') {
          ctx = this.topCtx
          board = this.topBoard
        } else {
          ctx = this.bottomCtx
          board = this.bottomBoard
        }
        // 선을 그릴때 좌표에 0.5픽셀씩 더하기 때문에 +1을 해준다.
        ctx.canvas.width = this.config.size + 1
        ctx.canvas.height = this.config.size / 2 + 1
        // 블록의 크기를 변경한다.
        ctx.scale(this.blockSize, this.blockSize)
        // 시작점 랜덤 지정
        let random = Math.random()
        let time = Date.now()
        let x = parseInt(((random * 100) + time) % (this.config.count - 2))
        if (x % 2 === 1) x += 1
        let y = 0
        if (reverse) y = this.config.count / 2 - 2
        // 블럭 생성
        let block = new Block(ctx, x, y)
        block.draw()
        board.block = block
        // 보드에 쌓인 블럭 그리기
        board.drawBoard()
        // 선을 그린다.
        this.drawGrid(ctx)
      },
      drawGrid(ctx) {
        // ctx.scale 초기화
        ctx.resetTransform()
        const size = this.config.size
        // 세로 선
        for (let x = 0; x <= size; x += this.blockSize) {
          ctx.moveTo(0.5 + x, 0)
          // 0.5를 더해야 선명한 선이 그려지고 오른쪽 아래 모서리까지 제대로 그려진다.
          // 해당 값을 제거하고 실행하면 왜 이렇게 처리 했는지 알수 있음
          // 가로 선도 마찬가지
          ctx.lineTo(0.5 + x, 0.5 + size * this.blockSize)
        }
        // 가로 선
        for (let y = 0; y <= size; y += this.blockSize) {
          ctx.moveTo(0, 0.5 + y)
          ctx.lineTo(0.5 + size * this.blockSize, 0.5 + y)
        }
        ctx.strokeStyle = 'black'
        ctx.stroke()
        // ctx.scale 재설정
        ctx.scale(this.blockSize, this.blockSize)
      },
      down(position, reverse = false) {
        let ctx
        let board
        if (position === 'top') {
          ctx = this.topCtx
          board = this.topBoard
        } else {
          ctx = this.bottomCtx
          board = this.bottomBoard
        }

        if (reverse) board.block.y -= 1
        else board.block.y += 1
        if (board.valid(board.block) === false) {
          if (reverse) board.block.y += 1
          else board.block.y -= 1
          board.freeze()
          if (reverse) {
            if (board.block.y === (this.config.count / 2) -2 ) {
              this.isPause = true
              return
            }
          } else {
            if (board.block.y === 0) {
              this.isPause = true
              return
            }
          }
          this.init(position, reverse)
        } else {
          board.block.move(board.block)
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
          board.block.draw()
        }
        // 보드에 쌓인 블럭 그리기
        board.drawBoard()
        // 그리드 그리기
        this.drawGrid(ctx)
      },
      handleKey(e) {
        if (e.code === 'KeyP') this.isPause = !this.isPause
        else if (e.code === 'KeyR') {
          this.isPause = false
          this.topBoard.reset()
          this.bottomBoard.reset()
          this.init('top')
          this.init('bottom', true)
        }
      },
      initBoard(position) {
        const top = position === 'top' ? true : false
        if (top) {
          this.topBoard = new Board(this.config.count / 2, this.config.count)
          this.topBoard.ctx = this.topCtx
          this.topBoard.reset()
        } else {
          this.bottomBoard = new Board(this.config.count / 2, this.config.count)
          this.bottomBoard.ctx = this.bottomCtx
          this.bottomBoard.reset()
        }
      },
    },
  }
</script>

<style>
  /* CSS */
  #main {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  canvas {
    margin-bottom: -5px;
  }
</style>
