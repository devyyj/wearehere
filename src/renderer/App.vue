<template>
  <div id="app" :style="config.bodyStyle">
    <div id="main">
      <canvas id="top-board" :style="config.boardStyle"></canvas
      ><canvas id="bottom-board" :style="config.boardStyle"></canvas>
    </div>
    <b-modal
      id="env"
      centered
      title="환경설정"
      @show="handleShow"
      @ok="handleOK"
      @hide="handleHide"
    >
      <b-form-row>
        <b-col>
          <b-form-group
            description="범위 : ±90까지. 소수 6자리까지 가능. 속도는 1단계부터 7단계까지 있으며 단계가 낮을수록 빠름."
            label="위도"
            :valid-feedback="validFeedbackLatitude"
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.tempLatitude"
              :state="stateLatitude"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            description="범위 : ±180까지. 소수 6자리까지 가능."
            label="경도"
            :valid-feedback="validFeedbackLongitude"
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.tempLongitude"
              :state="stateLongitude"
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col>
          <b-form-group label="블럭 색상">
            <b-form-input
              type="color"
              v-model="config.blockColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="그리드 색상">
            <b-form-input
              type="color"
              v-model="config.inputGridColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col>
          <b-form-group label="배경 색상">
            <b-form-input
              type="color"
              v-model="config.inputBackgroundColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="여백 색상">
            <b-form-input
              type="color"
              v-model="config.inputMarginColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-alert v-if="alert" show variant="danger"
        >유효하지 않은 값이 있습니다.</b-alert
      >
    </b-modal>
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
          latitude: 90, // 위도, 속도, 입력값 범위 : 0-90
          longitude: 0, // 경도, 블럭수, 입력값 범위 : 0-180
          tempLatitude: 0,
          tempLongitude: 0,
          endSpeed: 1000, // 스테이지 종료 속도
          speed: 90, // 실제 블럭 속도
          count: 20, // 실제 블럭 수
          blockColor: '#000000',
          gridColor: '#808080',
          inputGridColor: '#808080',
          inputBackgroundColor: '#ffffff',
          inputMarginColor: '#ffffff',
          boardStyle: {
            backgroundColor: '#ffffff',
          },
          bodyStyle: {
            height: '0px',
            backgroundColor: '#ffffff',
          },
        },
        isPause: false,
        isPauseR: false,
        downInterval: undefined,
        endInterval: undefined,
        alert: false,
        end: false,
        endCount: 0,
      }
    },
    computed: {
      blockSize() {
        return this.config.size / this.config.count
      },
      stateLatitude() {
        return (
          Math.abs(parseInt(this.config.tempLatitude)) <= 90 &&
          this.config.tempLatitude.length <= 9
        )
      },
      stateLongitude() {
        return (
          Math.abs(parseInt(this.config.tempLongitude)) <= 180 &&
          this.config.tempLongitude.length <= 10
        )
      },
      calculateLongitude() {
        // 한 줄에 20~140개. 즉 120의 범위를 가짐. 짝수개만 취급하면 총 60단계
        // 경도 범위는 0~180
        // 180/60 = 3, 경도 범위 1당 블럭 수 1단계씩 올리면 됨.
        // 블럭수 1단계는 2개씩 증가
        return (
          20 + Math.ceil(Math.abs(parseInt(this.config.tempLongitude)) / 3) * 2
        )
      },
      validFeedbackLongitude() {
        return `한 줄에 ${this.calculateLongitude}개의 블럭이 생성됩니다.`
      },
      validFeedbackLatitude() {
        return `${
          Math.floor(Math.abs(this.config.tempLatitude / 13)) + 1
        } 단계 속도가 적용됩니다.`
      },
    },
    created() {
      // resize 이벤트 리스너 등록
      window.addEventListener('resize', () => {
        this.init()
      })

      // 키보드 이벤트 리스너 등록
      window.addEventListener('keydown', this.handleKey)
    },
    mounted() {
      this.topCtx = document.getElementById('top-board').getContext('2d')
      this.bottomCtx = document.getElementById('bottom-board').getContext('2d')

      this.init()
      this.resetInterval()
    },
    methods: {
      init() {
        this.config.bodyStyle.height = window.innerHeight + 'px'

        this.setBoardSize()

        this.initBoard('top')
        this.initBoard('bottom')

        this.initBlock('top')
        this.initBlock('bottom', true)
      },
      initBlock(position, reverse = false) {
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
        let x = parseInt(Math.random() * (this.config.count - 2))
        if (x % 2 === 1) x += 1
        let y = 0
        if (reverse) y = this.config.count / 2 - 2
        // 블럭 생성
        let block = new Block(ctx, x, y, this.config.blockColor)
        block.draw()
        board.block = block
        // 보드에 쌓인 블럭 그리기
        board.drawBoard()
      },
      initBoard(position) {
        const top = position === 'top' ? true : false
        if (top) {
          this.topBoard = new Board(
            this.config.count / 2,
            this.config.count,
            this.config.blockColor,
          )
          this.topBoard.ctx = this.topCtx
          this.topBoard.reset()
        } else {
          this.bottomBoard = new Board(
            this.config.count / 2,
            this.config.count,
            this.config.blockColor,
          )
          this.bottomBoard.ctx = this.bottomCtx
          this.bottomBoard.reset()
        }
      },
      drawGrid(ctx, reverse = false) {
        // ctx.scale 초기화
        ctx.resetTransform()
        const size = this.config.size
        // 세로 선
        for (let x = 0; x <= size; x += this.blockSize) {
          ctx.moveTo(0.5 + x, 0)
          // 0.5를 더해야 선명한 선이 그려지고 오른쪽 아래 모서리까지 제대로 그려진다.
          // 해당 값을 제거하고 실행하면 왜 이렇게 처리 했는지 알수 있음
          // 가로 선도 마찬가지
          ctx.lineTo(0.5 + x, size * this.blockSize)
        }
        // 가로 선
        for (let y = 0; y <= size; y += this.blockSize) {
          if (!reverse && y === size) continue
          ctx.moveTo(0, 0.5 + y)
          ctx.lineTo(size * this.blockSize, 0.5 + y)
        }
        ctx.strokeStyle = this.config.gridColor
        ctx.stroke()
        // ctx.scale 재설정
        ctx.scale(this.blockSize, this.blockSize)
      },
      endStage(position) {
        let board
        position === 'top'
          ? (board = this.topBoard)
          : (board = this.bottomBoard)

        board.setEndRow(0)
        board.drawBoard(true)
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

          // 게임 종료 조건
          if (board.isFullRow(reverse)) {
            reverse ? (this.isPauseR = true) : (this.isPause = true)
            // pause 키를 누른게 아니라 게임 종료 조건에 따라 게임이 멈췄다면
            // this.end에 true를 설정하여 스테이지를 종료한다.
            if (this.isPause && this.isPauseR) {
              this.end = true
              this.resetInterval()
            }
            return
          }

          this.initBlock(position, reverse)
        } else {
          board.block.move(board.block)
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
          board.block.draw()
        }
        // 보드에 쌓인 블럭 그리기
        board.drawBoard()
        // 그리드 그리기
        this.drawGrid(ctx, reverse)
      },
      setBoardSize() {
        this.config.size =
          parseInt(window.innerHeight / this.config.count) * this.config.count
      },
      restart() {
        this.end = false
        this.isPause = false
        this.isPauseR = false
        this.topBoard.reset()
        this.bottomBoard.reset()
        this.initBlock('top')
        this.initBlock('bottom', true)
      },
      resetInterval() {
        // 스테이지 종료 인터벌
        clearInterval(this.endInterval)
        this.endInterval = setInterval(() => {
          // [NOW] 한줄씩 처리하는 방법 고민중
          if (this.end && this.endCount < this.blockSize / 2) {
            this.endStage('top')
            this.endStage('bottom')
          }
        }, this.config.endSpeed)

        // 블럭을 떨어뜨리는 인터벌
        clearInterval(this.downInterval)
        this.downInterval = setInterval(() => {
          if (this.isPause && this.isPauseR) return
          this.down('top')
          this.down('bottom', true)
        }, this.config.speed)
      },
      handleKey(e) {
        if (e.code === 'KeyP') {
          this.isPause = !this.isPause
          this.isPauseR = !this.isPauseR
        } else if (e.code === 'KeyR') {
          this.restart()
        } else if (e.code === 'KeyE') {
          this.isPause = true
          this.isPauseR = true
          this.$bvModal.show('env')
        }
      },
      handleShow() {
        this.config.tempLatitude = String(this.config.latitude)
        this.config.tempLongitude = String(this.config.longitude)
        this.alert = false
      },
      handleOK(evt) {
        if (this.stateLatitude && this.stateLongitude) {
          // 환경 설정 창에서 보여줄 값
          this.config.latitude = this.config.tempLatitude
          this.config.longitude = this.config.tempLongitude
          // 실제 적용할 값
          const speedArr = [0, 2, 4, 8, 16, 32, 64]
          this.config.speed =
            speedArr[Math.floor(Math.abs(this.config.tempLatitude / 13))]
          this.config.count = this.calculateLongitude

          this.config.gridColor = this.config.inputGridColor

          this.config.boardStyle.backgroundColor = this.config.inputBackgroundColor
          this.config.bodyStyle.backgroundColor = this.config.inputMarginColor

          this.init()
          this.resetInterval()
          this.restart()
        } else {
          evt.preventDefault()
          this.alert = true
        }
      },
      handleHide() {
        this.isPause = false
        this.isPauseR = false
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
    margin-bottom: -7px;
  }
</style>
