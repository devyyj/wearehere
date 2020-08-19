<template>
  <div id="app" style="text-align: center;">
    <canvas id="board" class="game-board"></canvas>
  </div>
</template>

<script>
  import Board from './board'
  import Block from './block'
  // const {remote} = require('electron')

  export default {
    name: 'wearehere',
    data() {
      return {
        canvas: undefined,
        ctx: undefined,
        board: undefined,
        config: {
          size: 0, // board 크기
          count: 20, // 한 줄당 block 수
        },
        isPause: false,
      }
    },
    computed: {
      blockSize() {
        // 선명한 선을 그리기 위해 int 자료형으로 리턴
        return parseInt(this.config.size / this.config.count)
      },
    },
    created() {
      // resize 이벤트 리스너 등록
      window.addEventListener('resize', () => {
        // - 4 를 해야 세로 스크롤이 안생김
        this.config.size = window.innerHeight
        this.init()
      })

      // 키보드 이벤트 리스너 등록
      window.addEventListener('keydown', this.handleKey)
    },
    mounted() {
      // const currentWindow = remote.getCurrentWindow()
      // currentWindow.setFullScreen(true)

      // 초기화
      this.config.size = window.innerHeight
      this.init()

      setInterval(() => {
        if (this.isPause) return
        this.down()
      }, 100)
    },
    methods: {
      init() {
        this.canvas = document.getElementById('board')
        this.ctx = this.canvas.getContext('2d')
        // 상수를 사용해 캔버스의 크기를 계산한다.
        // 선을 그릴때 좌표에 0.5픽셀씩 더하기 때문에 +1을 해준다.
        this.ctx.canvas.width = this.config.size - (this.config.size % this.blockSize) + 1
        this.ctx.canvas.height = this.config.size - (this.config.size % this.blockSize) + 1

        // 블록의 크기를 변경한다.
        this.ctx.scale(this.blockSize, this.blockSize)

        // 보드 리셋
        if (this.board === undefined) {
          this.board = new Board(this.config.count, this.config.count)
          this.board.ctx = this.ctx
          this.board.reset()
        }

        // 시작점 랜덤 지정
        let x = parseInt((Math.random() * 100) % (this.config.count - 2))
        if (x % 2 === 1) x += 1

        // 블럭 생성
        let block = new Block(this.ctx, x)
        block.draw()
        this.board.block = block

        // 선을 그린다.
        this.drawGrid()

        // 보드에 쌓인 블럭 그리기
        this.board.drawBoard()
      },
      drawGrid() {
        // ctx.scale 초기화
        this.ctx.resetTransform()
        const size = this.config.size
        // 왜 0.5를 더해야 선명한 선이 그려지는 지 모르겠음.
        // 세로 선
        for (let x = 0; x <= size; x += this.blockSize) {
          this.ctx.moveTo(0.5 + x, 0)
          // blockSize를 int형으로 리턴하기 때문에 height % this.blockSize 값을 뺀다
          // 오른쪽 아래 모서리까지 그리기 위해 0.5를 더한다.
          // 해당 값을 제거하고 실행하면 왜 이렇게 처리 했는지 알수 있음
          // 가로 선도 마찬가지
          this.ctx.lineTo(0.5 + x, size - (size % this.blockSize) + 0.5)
        }
        // 가로 선
        for (let y = 0; y <= size; y += this.blockSize) {
          this.ctx.moveTo(0, 0.5 + y)
          this.ctx.lineTo(size - (size % this.blockSize) + 0.5, 0.5 + y)
        }

        this.ctx.strokeStyle = 'black'
        this.ctx.stroke()
        // ctx.scale 재설정
        this.ctx.scale(this.blockSize, this.blockSize)
      },
      down() {
        this.board.block.y += 1
        if (this.board.valid(this.board.block) === false) {
          this.board.block.y -= 1
          this.board.freeze()
          if(this.board.block.y === 0) {
            this.isPause = true
            return
          }
          this.init()
        } else {
          this.board.block.move(this.board.block)
          this.ctx.clearRect(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height,
          )
          this.board.block.draw()
        }
        // 보드에 쌓인 블럭 그리기
        this.board.drawBoard()
        // 그리드 그리기
        this.drawGrid()
      },
      handleKey(e) {
        if (e.code === 'KeyP') this.isPause = !this.isPause
        else if (e.code === 'KeyR') {
          this.isPause = false
          this.board = undefined
          this.init()
        }
      },
    },
  }
</script>

<style>
  /* CSS */
</style>
