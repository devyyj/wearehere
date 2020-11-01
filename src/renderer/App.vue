<template>
  <div id="app" :style="config.bodyStyle">
    <div id="main">
      <canvas id="top-board" :style="config.boardStyle"></canvas
      ><canvas id="bottom-board" :style="config.boardStyle"></canvas>
    </div>
    <b-modal
      id="env"
      centered
      scrollable
      title="환경설정"
      ref="modal"
      ok-only
      no-close-on-backdrop
      hide-header-close 
      @ok="handleOK"
      @show="handleShow"
      @hide="handleHide"
    >
      <b-tabs content-class="mt-3">
        <b-tab title="First" active @click="handleTab(0)"> </b-tab>
        <b-tab title="Second" @click="handleTab(1)"> </b-tab>
        <b-tab title="Third" @click="handleTab(2)"> </b-tab>
      </b-tabs>
      <b-form-group>
        <b-form-checkbox
          switch
          size="lg"
          v-model="config.apply"
          :value="true"
          :unchecked-value="false"
        >
          설정 적용
        </b-form-checkbox>
      </b-form-group>

      <b-form-row>
        <b-col>
          <b-form-group
            description="±90까지 가능. 소수 6자리까지 가능. 속도는 1단계부터 7단계까지 있으며 단계가 낮을수록 빠름."
            label="위도"
            :valid-feedback="validFeedbackLatitude"
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.inputLatitude"
              :state="stateLatitude"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            description="±180까지 가능. 소수 6자리까지 가능."
            label="경도"
            :valid-feedback="validFeedbackLongitude"
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.inputLongitude"
              :state="stateLongitude"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="종료 속도(초)"
            description="한 줄씩 지워지는 속도. 0보다 큰 실수 입력 가능. ex) 0.5"
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.inputEndSpeed"
              :state="stateEndSpeed"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="대기 시간(초)"
            description="다음 스테이지로 넘어가기 전 대기하는 시간. 1보다 큰 실수 입력 가능."
            :invalid-feedback="'입력 값 범위를 확인하세요'"
          >
            <b-form-input
              type="number"
              v-model="config.inputWaitTime"
              :state="stateWaitTime"
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col>
          <b-form-group label="블럭 색">
            <b-form-input
              type="color"
              v-model="config.inputBlockColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="그리드 색">
            <b-form-input
              type="color"
              v-model="config.inputGridColor"
            ></b-form-input>
            <b-form-checkbox
              v-model="config.inputDrawGrid"
              :value="true"
              :unchecked-value="false"
            >
              그리기
            </b-form-checkbox>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="배경 색">
            <b-form-input
              type="color"
              v-model="config.inputBackgroundColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="여백 색">
            <b-form-input
              type="color"
              v-model="config.inputMarginColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="종료 색">
            <b-form-input
              type="color"
              v-model="config.inputEndColor"
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row>
        <b-col>
          <b-button variant="outline-dark" block @click="handleGetImagePath()"
            >이미지 선택</b-button
          >
        </b-col>
        <b-col>
          <b-button
            variant="outline-danger"
            block
            @click="handleInitImagePath()"
            >이미지 초기화</b-button
          >
        </b-col>
        <b-col>
          <b-form-checkbox
            v-model="config.inputSpin"
            :value="true"
            :unchecked-value="false"
          >
            이미지 회전
          </b-form-checkbox>
        </b-col>
      </b-form-row>

      <hr />

      <b-form-row>
        <b-col
          ><b-button block variant="outline-primary" @click="handleSave()"
            >저장하기</b-button
          ></b-col
        >
        <b-col
          ><b-button block variant="outline-primary" @click="handleLoad()"
            >불러오기</b-button
          ></b-col
        >
      </b-form-row>
    </b-modal>
  </div>
</template>

<script>
  import Board from './board'
  import Block from './block'
  import fs from 'fs'
  import {time, timeEnd, timeLog} from 'console'
  import * as _ from 'lodash'

  const du = require('datauri/sync')
  const {dialog} = require('electron').remote
  const electron = require('electron')

  export default {
    name: 'wearehere',
    data() {
      return {
        topCtx: undefined,
        bottomCtx: undefined,
        topBoard: undefined,
        bottomBoard: undefined,
        pause: false,
        pauseR: false,
        pauseEnd: false,
        downInterval: undefined,
        endInterval: undefined,
        end: false,
        endCount: 0,
        saveConfig: {},
        configIndex: 0,
        configArr: [],
        config: {
          apply: true,
          size: 0, // board 크기
          endSpeed: 100, // 스테이지 종료 속도, ms
          waitTime: 1000, // 다음 스테이지 시작전 대기 시간, ms
          speed: 90, // 실제 블럭 속도 default 90
          count: 20, // 실제 블럭 수 default 20
          blockColor: '#000000',
          gridColor: '#808080',
          endColor: '#000000',
          boardStyle: {
            backgroundColor: '#ffffff',
          },
          bodyStyle: {
            height: '0px',
            backgroundColor: '#ffffff',
          },
          drawGrid: true,
          spin: false,
          imagePath: [],
          inputImagePath: [],
          inputLatitude: '90', // 위도, 속도, 입력값 범위 : 0-90, default 90
          inputLongitude: '0', // 경도, 블럭수, 입력값 범위 : 0-180, default 0
          inputEndSpeed: 0.1,
          inputWaitTime: 1,
          inputBlockColor: '#000000',
          inputGridColor: '#808080',
          inputEndColor: '#000000',
          inputBackgroundColor: '#ffffff',
          inputMarginColor: '#ffffff',
          inputDrawGrid: true,
          inputSpin: false,
        },
      }
    },
    computed: {
      blockSize() {
        return this.config.size / this.config.count
      },
      stateLatitude() {
        return (
          Math.abs(parseInt(this.config.inputLatitude)) <= 90 &&
          this.config.inputLatitude.length <= 9
        )
      },
      stateLongitude() {
        return (
          Math.abs(parseInt(this.config.inputLongitude)) <= 180 &&
          this.config.inputLongitude.length <= 10
        )
      },
      calculateLongitude() {
        // 한 줄에 20~140개. 즉 120의 범위를 가짐. 짝수개만 취급하면 총 60단계
        // 경도 범위는 0~180
        // 180/60 = 3, 경도 범위 1당 블럭 수 1단계씩 올리면 됨.
        // 블럭수 1단계는 2개씩 증가
        return (
          20 + Math.ceil(Math.abs(parseInt(this.config.inputLongitude)) / 3) * 2
        )
      },
      validFeedbackLongitude() {
        return `한 줄에 ${this.calculateLongitude}개의 블럭이 생성됩니다.`
      },
      validFeedbackLatitude() {
        return `${
          Math.floor(Math.abs(this.config.inputLatitude / 13)) + 1
        } 단계 속도가 적용됩니다.`
      },
      stateEndSpeed() {
        return this.config.inputEndSpeed > 0
      },
      stateWaitTime() {
        return this.config.inputWaitTime >= 1
      },
      countImageFile() {
        const count = this.config.inputImagePath.length
          ? this.config.inputImagePath.length
          : this.config.imagePath.length
        return `${count}개의 이미지가 선택되어있습니다.`
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
      this.initConfigArr()
      this.init()
    },
    methods: {
      init() {
        // 여백색을 지정하기 위해서 설정. 태그의 높이가 0으로 설정돼있음.
        this.config.bodyStyle.height = window.innerHeight + 'px'

        this.setBoardSize()

        this.initBoard()
        this.initBoard(true)

        this.initBlock()
        this.initBlock(true)

        this.resetInterval()
      },
      initBlock(reverse = false) {
        let ctx
        let board
        if (reverse === false) {
          ctx = this.topCtx
          board = this.topBoard
        } else {
          ctx = this.bottomCtx
          board = this.bottomBoard
        }
        // 시작점 랜덤 지정
        let random = Math.random()
        let time = Date.now()
        let x = parseInt(Math.random() * (this.config.count - 2))
        if (x % 2 === 1) x += 1
        let y = 0
        if (reverse) y = this.config.count / 2 - 2
        // 블럭 생성
        let block = new Block(
          ctx,
          x,
          y,
          this.config.blockColor,
          this.config.imagePath,
        )
        // 비어 있는 공간에만 블럭을 그린다.
        if (board.emptyCheck(block, reverse)) {
          board.block = block
          block.draw(this.blockSize, this.config.drawGrid, this.config.spin)
        }
      },
      initBoard(reverse = false) {
        if (reverse === false) {
          this.topBoard = new Board(
            this.config.count / 2,
            this.config.count,
            this.config.blockColor,
            this.config.imagePath,
          )
          this.topBoard.ctx = this.topCtx
          this.topBoard.reset()
        } else {
          this.bottomBoard = new Board(
            this.config.count / 2,
            this.config.count,
            this.config.blockColor,
            this.config.imagePath,
          )
          this.bottomBoard.ctx = this.bottomCtx
          this.bottomBoard.reset()
        }

        // canvas 전체에 그리드를 그린다
        if (this.config.drawGrid) {
          let ctx
          reverse === false ? (ctx = this.topCtx) : (ctx = this.bottomCtx)
          this.drawGrid(ctx, reverse)
        }
      },
      drawGrid(ctx, reverse = false) {
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
      },
      // 게임 종료 액션, 한 줄씩 지정된 색으로 덮어진다.
      endStage(count, reverse = false) {
        let board
        reverse === false ? (board = this.topBoard) : (board = this.bottomBoard)

        board.setEndRow(count, reverse)
        board.endBoard(this.blockSize, this.config.endColor)
      },
      down(reverse = false) {
        let ctx
        let board
        if (reverse === false) {
          ctx = this.topCtx
          board = this.topBoard
        } else {
          ctx = this.bottomCtx
          board = this.bottomBoard
        }
        // 블럭이 계속 움직일 수 있는 지 확인.
        // 움직일 수 없다면 블럭을 보드에 고정하고 다음 블럭을 생성.
        if (board.valid(reverse) === false) {
          board.freeze()
          // 게임 종료 조건
          if (board.isFullRow(reverse)) {
            reverse ? (this.pauseR = true) : (this.pause = true)
            // pause 키를 누른게 아니라 게임 종료 조건에 따라 게임이 멈췄다면
            // this.end에 true를 설정하여 스테이지를 종료한다.
            if (this.pause && this.pauseR) {
              this.end = true
              this.resetInterval()
            }
            return
          }
          // 새로운 블럭 생성
          this.initBlock(reverse)
        } else {
          // 현재 블럭을 지운다.
          board.block.clear(this.blockSize, this.config.drawGrid)
          // 블럭을 이동한다.
          board.block.move(reverse)
          // 블럭을 회전한다.
          if (this.config.spin) board.block.spin()
          // 이동된 블럭을 그린다.
          board.block.draw(
            this.blockSize,
            this.config.drawGrid,
            this.config.spin,
          )
        }
      },
      setBoardSize() {
        this.config.size =
          parseInt(window.innerHeight / this.config.count) * this.config.count
        // 선을 그릴때 좌표에 0.5픽셀씩 더하기 때문에 +1을 해준다.
        this.topCtx.canvas.width = this.config.size + 1
        this.topCtx.canvas.height = this.config.size / 2 + 1
        this.bottomCtx.canvas.width = this.config.size + 1
        this.bottomCtx.canvas.height = this.config.size / 2 + 1
      },
      restart() {
        this.end = false
        this.endCount = 0
        this.pause = false
        this.pauseR = false
        this.setConfig()
        this.init()
      },
      resetInterval() {
        // 블럭을 떨어뜨리는 인터벌
        clearInterval(this.downInterval)
        this.downInterval = setInterval(() => {
          if (this.pause && this.pauseR) return
          this.down()
          this.down(true)
        }, this.config.speed)
        // 스테이지 종료 인터벌
        clearInterval(this.endInterval)
        this.endInterval = setInterval(() => {
          if(this.pauseEnd) return
          if (this.end) {
            if (this.endCount < this.config.count / 2) {
              // 위에서 아래로 한칸씩 지워 나간다.
              console.log(
                `스테이지 종료중 -> ${this.endCount} / ${
                  this.config.count / 2 - 1
                }`,
              )
              this.endStage(this.endCount)
              this.endStage(this.endCount, true)
              this.endCount++
            } else {
              // 모두 지워지면
              console.log(
                `다음 스테이지 대기중 -> ${this.config.waitTime / 1000}s`,
              )
              this.end = false
              setTimeout(() => {
                this.restart()
              }, this.config.waitTime)
            }
          }
        }, this.config.endSpeed)
      },
      // 이미지를 미리 로딩해 둔다, 아니면 이미지를 매번 로딩해서 깜빡거림
      setImagePath(imagePath) {
        console.log(`setImagePath`)
        let allExists = true
        let msg = ''

        let tempPath = imagePath.map((x) => {
          if (fs.existsSync(x)) {
            let img = new Image()
            img.src = du(x).content
            return img
          } else {
            allExists = false
            msg += `${x}\n`
          }
        })

        if (allExists) {
          this.config.imagePath = tempPath
          console.log(this.config.imagePath)
        } else {
          alert(
            '아래의 파일을 찾을 수 없습니다.\n\n' +
              msg +
              '\n이미지 파일을 설정하지 않습니다.',
          )
          this.handleInitImagePath()
        }
      },
      setConfig() {
        console.log('setConfig')
        if (this.configArr.every((x) => x.apply === false)) {
          this.configArr[0].apply = true
        }

        for (; this.configIndex < this.configArr.length; ) {
          if (this.configArr[this.configIndex].apply) {
            this.config = this.configArr[this.configIndex]
            console.log(`set config index ${this.configIndex}`)
            this.configIndex++
            if (this.configIndex >= this.configArr.length) this.configIndex = 0
            break
          }
          this.configIndex++
          if (this.configIndex >= this.configArr.length) this.configIndex = 0
        }
      },
      initConfigArr() {
        // 1 사이클 === 3 스테이지
        // 최대 3개의 환경을 가질 수 있다.
        // 기본 설정은 first 설정만 적용되도록 한다.

        // first
        this.configArr.push(_.cloneDeep(this.config))
        // second
        let copy = _.cloneDeep(this.config)
        copy.apply = false
        this.configArr.push(copy)
        // third
        copy = _.cloneDeep(this.config)
        copy.apply = false
        this.configArr.push(copy)
      },
      checkValid() {
        return (
          this.stateLatitude &&
          this.stateLongitude &&
          this.stateEndSpeed &&
          this.stateWaitTime &&
          this.configArr.some((x) => x.apply === true)
        )
      },
      handleKey(e) {
        if (e.code === 'KeyP') {
          this.pause = !this.pause
          this.pauseR = !this.pauseR
          this.pauseEnd = !this.pauseEnd
        } else if (e.code === 'KeyR') {
          // 인덱스 재설정
          this.configIndex = 0
          this.restart()
        } else if (e.code === 'KeyE') {
          this.pause = true
          this.pauseR = true
          this.pauseEnd = true
          this.$bvModal.show('env')
        } else if (e.code === 'KeyF') {
          console.log('keyF')
          const window = electron.remote.getCurrentWindow()
          if (window.isFullScreen()) window.setFullScreen(false)
          else window.setFullScreen(true)
        }
      },
      handleShow() {
        this.handleTab(0)
      },
      handleOK(evt) {
        if (this.checkValid()) {
          for (let i = 0; i < this.configArr.length; i++) {
            this.config = this.configArr[i]

            // 속도 및 크기 설정
            const speedArr = [0, 2, 4, 8, 16, 32, 64]
            this.config.speed =
              speedArr[Math.floor(Math.abs(this.config.inputLatitude / 13))]
            this.config.count = this.calculateLongitude

            // 색상 설정
            this.config.blockColor = this.config.inputBlockColor
            this.config.gridColor = this.config.inputGridColor
            this.config.drawGrid = this.config.inputDrawGrid
            this.config.endColor = this.config.inputEndColor
            this.config.boardStyle.backgroundColor = this.config.inputBackgroundColor
            this.config.bodyStyle.backgroundColor = this.config.inputMarginColor

            // 종료 및 스테이지 대기 시간 설정
            this.config.endSpeed = this.config.inputEndSpeed * 1000
            this.config.waitTime = this.config.inputWaitTime * 1000

            // 이미지 로드
            if (this.config.inputImagePath.length) {
              this.config.imagePath = this.config.inputImagePath
              this.setImagePath(this.config.imagePath)
            }

            // 스핀 설정
            this.config.spin = this.config.inputSpin
          }

          // 인덱스 재설정
          this.configIndex = 0

          this.restart()
        } else {
          evt.preventDefault()
          if (this.configArr.every((x) => x.apply === false)) {
            alert(
              '최소 하나의 설정이 적용돼야합니다.\nFirst 환경 설정을 강제로 적용합니다.',
            )
            this.configArr[0].apply = true
            this.restart()
            this.$refs["modal"].hide();
          } else alert('유효하지 않은 입력 값이 있습니다.')
        }
      },
      handleHide() {
        console.log('handleHide')
        if (this.checkValid() === false) return
        this.pause = false
        this.pauseR = false
        this.pauseEnd = false
      },
      handleSave() {
        console.log('handleSave')
        let options = {
          filters: [{name: 'WE ARE HERE File', extensions: ['wah']}],
        }
        let savePath = dialog.showSaveDialog(options)
        if (savePath) {
          console.log(`save file path : ${savePath}`)
          this.saveConfig.data = this.configArr
          let jsonConfig = JSON.stringify(this.saveConfig)
          console.log(`save json file : ${jsonConfig}`)
          fs.writeFileSync(savePath, jsonConfig)
        }
      },
      handleLoad() {
        console.log('handleLoad')
        let options = {
          filters: [{name: 'WE ARE HERE File', extensions: ['wah']}],
        }
        let loadPath = dialog.showOpenDialog(options)
        if (loadPath) {
          console.log(`load file path : ${loadPath[0]}`)
          let readFile = fs.readFileSync(loadPath[0], {encoding: 'utf8'})
          console.log(`load file data : ${readFile}`)
          this.configArr = JSON.parse(readFile).data
          this.handleOK() // 예외처리가 복잡해서 설정 파일을 불러오자 마자 바로 적용하여 실행한다.
          this.$refs["modal"].hide();
        }
      },
      handleGetImagePath() {
        console.log('handleGetImagePath')
        const options = {
          filters: [{name: 'Images', extensions: ['jpg', 'png']}],
          properties: ['openFile', 'multiSelections'],
        }
        const imagePath = dialog.showOpenDialog(options)
        if (imagePath) {
          console.log(imagePath)
          this.config.inputImagePath = imagePath
        }
      },
      handleInitImagePath() {
        console.log('handleInitImagePath')
        this.config.inputImagePath = this.config.imagePath = []
      },
      handleTab(n) {
        console.log(this.configArr[n])
        this.config = this.configArr[n]
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
    margin-bottom: -8px;
  }
</style>
