<template>
  <div id="app">
    <canvas id="board" class="game-board"></canvas>
  </div>
</template>

<script>
import Board from "./board";
import Block from "./block";

export default {
  name: "wearehere",
  data() {
    return {
      canvas: undefined,
      ctx: undefined,
      board: undefined,
      config: {
        width: 800,
        height: 800,
        cols: 20,
        rows: 20,
      },
    };
  },
  computed: {
    blockWidthSize() {
      return this.config.width / this.config.cols;
    },
    blockHeightSize() {
      return this.config.height / this.config.rows;
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.canvas = document.getElementById("board");
      this.ctx = this.canvas.getContext("2d");

      // 상수를 사용해 캔버스의 크기를 계산한다.
      // 선을 그릴때 좌표에 0.5픽셀씩 더하기 때문에 +1을 해준다.
      this.ctx.canvas.width = this.config.width + 1;
      this.ctx.canvas.height = this.config.height + 1;

      // 선을 그린다.
      this.drawGrid(this.config.width, this.config.height);

      // 블록의 크기를 변경한다.
      this.ctx.scale(this.blockWidthSize, this.blockHeightSize);

      // 보드 생성
      this.board = new Board(this.config.rows, this.config.cols);
      this.board.reset();
      console.table(this.board.grid);

      // 블럭 그리기
      let block = new Block(this.ctx);
      block.draw();

      this.board.block = block;
    },
    drawGrid(width, height) {
      // 왜 0.5를 더해야 선명한 선이 그려지는 지 모르겠음.
      // 세로 선
      for (let x = 0; x <= width; x += this.blockWidthSize) {
        this.ctx.moveTo(0.5 + x, 0);
        this.ctx.lineTo(0.5 + x, height);
      }
      // 가로 선
      for (let y = 0; y <= height; y += this.blockHeightSize) {
        this.ctx.moveTo(0, 0.5 + y);
        this.ctx.lineTo(width, 0.5 + y);
      }
      this.ctx.strokeStyle = "black";
      this.ctx.stroke();
    },
  },
};
</script>

<style>
/* CSS */
</style>
