<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16 //进度条按钮的宽度
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created(){
        this.touch = {}
      },
      methods: {
        progressTouchStart(e){
          this.touch.initiated = true //表示已经初始化，开始move
          this.touch.startX = e.touches[0].pageX //横坐标
          this.touch.left = this.$refs.progress.clientWidth //当前位置偏移量
        },
        progressTouchMove(e){
          if(!this.touch.initiated){
            return
          }
          const deltaX = e.touches[0].pageX - this.touch.startX //移动距离
          const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
          this._offset(offsetWidth)
        },
        progressTouchEnd(){
          this.touch.initiated = false
          this._triggerPercent()
        },
        progressClick(e){
          //progressBar所在的位置
          const rect = this.$refs.progressBar.getBoundingClientRect()
          const offsetWidth = e.pageX - rect.left
          this._offset(offsetWidth)
          //this._offset(e.offsetX)
          this._triggerPercent()
        },
        _offset(offsetWidth){ //进度条偏移
          this.$refs.progress.style.width = `${offsetWidth}px`
          this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)` //按钮跟着移动
        },
        _triggerPercent(){ //歌曲播放到相应位置
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const percent = this.$refs.progress.clientWidth / barWidth
          this.$emit('percentChange', percent)
        }
      },
      watch: {
        percent(newPercent){
          if(newPercent >= 0 && !this.touch.initiated){//不拖动的时候再改变进度条宽度
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            const offsetWidth = newPercent * barWidth //按钮偏移宽度
            this._offset(offsetWidth)
          }
        }
      }
  }
 
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>