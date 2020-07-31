<template>
  <div id="app">
    <canvas id="board" class="game-board"></canvas>
  </div>
</template>

<script>
  import Board from './Board'
  import Block from './Block'

  // 가로 세로 픽셀
  const PIXEL = 640
  // 한줄에 생성될 블럭 수
  const BOLCK_COUNT = 16
  // 정사각형이라 가로 세로를 따로 설정할 필요는 없지만,
  // 나중에 정사각형이 아닌 형태를 만들수 있도록 가로/세로 변수를 설정.
  const COLS = BOLCK_COUNT
  const ROWS = BOLCK_COUNT
  // 블럭 사이즈, 하나의 블럭이 이루는 픽셀
  const BLOCK_SIZE = PIXEL / BOLCK_COUNT

  let canvas
  let ctx
  let board

  export default {
    name: 'wearehere',
    data() {
      return {}
    },
    mounted() {
      this.init()
    },
    methods: {
      init() {
        canvas = document.getElementById('board')
        ctx = canvas.getContext('2d')

        // 상수를 사용해 캔버스의 크기를 계산한다.
        // 선을 그릴때 좌표에 0.5픽셀씩 더하기 때문에 +1을 해준다.
        ctx.canvas.width = COLS * BLOCK_SIZE + 1
        ctx.canvas.height = ROWS * BLOCK_SIZE + 1

        // 선을 그린다.
        this.drawGrid(PIXEL, PIXEL)

        // 블록의 크기를 변경한다.
        ctx.scale(BLOCK_SIZE, BLOCK_SIZE)

        // 보드 생성
        board = new Board(COLS, ROWS)
        board.reset()
        console.table(board.grid)

        // 블럭 그리기
        let block = new Block(ctx)
        block.draw()

        board.block = block
      },
      drawGrid(bw, bh) {
        // 왜 0.5를 더해야 선명한 선이 그려지는 지 모르겠음.
        // 세로 선
        for (var x = 0; x <= bw; x += BLOCK_SIZE) {
          ctx.moveTo(0.5 + x, 0)
          ctx.lineTo(0.5 + x, bh)
        }
        // 가로 선
        for (var x = 0; x <= bh; x += BLOCK_SIZE) {
          ctx.moveTo(0, 0.5 + x)
          ctx.lineTo(bw, 0.5 + x)
        }
        ctx.strokeStyle = 'black'
        ctx.stroke()
      },
    },
  }
</script>

<style>
  /* CSS */
</style>
