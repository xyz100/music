<!-- 播放器播放 -->
<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal" 
                @enter="enter" 
                @after-enter="afterEnter" 
                @leave="leave" 
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" 
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </Scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <ProgressBar :percent="percent" @percentChange="onProgerssBarChange"></ProgressBar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <Playlist ref="playlist"></Playlist>
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  // import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'components/playlist/playlist'
  import {playerMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0, //当前歌词所在的行
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      cdCls(){//图片旋转
        return this.playing ? 'play' : 'play pause'
      },
      playIcon(){//dom播放暂停显示不同按钮
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      // iconMode(){//判断是哪种模式
      //   return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      // },
      miniIcon(){
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls(){//歌曲没加载好之前，三个按钮变灰不可用
        return this.songReady ? '' : 'disable'
      },
      percent(){
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([ //获取状态
        'fullScreen',
        'playing',
        'currentIndex',
        'playList'
      ])
    },
    created(){
      this.touch = {}
    },
    methods: {
      back(){
        this.setFullScreen(false)
      },
      open(){
        this.setFullScreen(true)
      },
      enter(el, done){//el指操作的dom,done回调函数,执行后自动跳到afterEnter
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets:{
            duration: 400,
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter(){
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done){
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave(){
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      togglePlaying(){//歌曲播放暂停切换
        if(!this.songReady){//song没准备好时不许点击下一曲，防止点击过快报错
          return
        }
        this.setPlayingState(!this.playing)
        if(this.currentLyric){
          this.currentLyric.togglePlay()
        }       
      },
      prev(){
        if(!this.songReady){
          return
        }if(this.playList.length === 1){//歌曲列表长度为1的bug
          this.loop()
          return
        }else{
          let index = this.currentIndex - 1
          if(index === -1){
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          if(!this.playing){
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      next(){
        if(!this.songReady){
          return
        }
        if(this.playList.length === 1){//歌曲列表长度为1的bug
          this.loop()
          return
        }else{
          let index = this.currentIndex + 1
          if(index === this.playList.length){
            index = 0
          }
          this.setCurrentIndex(index) //修改currentIndex
          if(!this.playing){
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      end(){
        if(this.mode === playMode.loop){
          this.loop()
        }else{
          this.next()
        }
      },
      loop(){
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if(this.currentLyric){
          this.currentLyric.seek(0) //歌词跳到一开始位置
        }
      },
      ready(){//歌曲加载成功，缓冲至目前可播放状态
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      error(){//歌曲加载失败
        this.songReady = true
      },
      updateTime(e){
        this.currentTime = e.target.currentTime //audio当前播放时间
      },
      format(interval){//时间戳转化成分和秒形式
        interval = interval | 0 //向下取整 相当于Math.floor
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      //互动滚动条
      onProgerssBarChange(percent){
        const currentTime = this.currentSong.duration * percent
        //当前歌曲播放到相应位置时间 = 总时间 * 百分比
        this.$refs.audio.currentTime = currentTime
        if(!this.playing){
          this.togglePlaying()
        }
        //seek将此歌词定位到指定的位置
        if(this.currentLyric){
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // changeMode(){
      //   const mode = (this.mode + 1) % 3
      //   this.setPlayMode(mode)
      //   let list = null
      //   if(mode === playMode.random){
      //     list = shuffle(this.sequenceList)
      //   }else{
      //     list = this.sequenceList
      //   }
      //   //切换模式后 保证当前歌曲不变
      //   this.resetCurrentIndex (list)
      //   this.setPlayList(list)
      // },
      // resetCurrentIndex(list){
      //   //找到当前歌曲对应索引findIndex
      //   let index = list.findIndex((item) => {
      //     return item.id === this.currentSong.id
      //   })
      //   this.setCurrentIndex(index)
      // },
      getLyric(){//获取歌词
        // 调用项目中获取歌词的api，获取到的是使用js-base64转了格式后的歌词
        this.currentSong.getLyric().then((lyric) => {
          if(this.currentSong.lyric !== lyric){
            return
          }
          // 新建Lyric-parser歌词对象  
          this.currentLyric = new Lyric(lyric, this.handleLyric) //解析歌词
          if(this.playing){//歌曲播放时歌词也播放
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}){//当歌词每一行发生改变时回调一下 txt当前播放歌词
        this.currentLineNum = lineNum
        if(lineNum > 5){//行数大于5行 开始滚动
          //lineEl当前元素往上偏移5个位置 p标签
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          //滚动到lyricLine[2]这个位置
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        }else{
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      showPlaylist(){
        this.$refs.playlist.show()
      },
      middleTouchStart(e){
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e){
        if(!this.touch.initiated){
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        //上下滑动距离大于左右滑动距离，不动
        if(Math.abs(deltaY) > Math.abs(deltaX)){
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        //（-window.innerWidth，0）距离右侧的距离最大不超过0，最小不低于-window.innerWidth
        const offsetWidth = Math.min(0,Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd(){
        let offsetWidth
        let opacity
        if(this.currentShow === 'cd'){//屏幕向左滑动,超过10%页面左滑动
          if(this.touch.percent > 0.1){
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          }else{
            offsetWidth = 0
            opacity = 1
          }
        }else{
          if(this.touch.percent < 0.9){//屏幕向右滑动
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          }else{
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300

        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      _pad(num, n = 2){//n补0两位
        let len = num.toString().length
        while(len < n){
          num = '0' + num
          len++
        }
        return num
      },
      _getPosAndScale(){
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      //add: 'increment' // 映射 this.add() 为this.$store.commit('increment')
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong(newSong, oldSong){
        if(!newSong.id){
          return
        }
        if(newSong.id === oldSong.id){
          return
        }
        if(this.currentLyric){//歌词停止
          this.currentLyric.stop()
        }
        // this.$nextTick(() => {
        clearTimeout(this.timer)
        this.timeer = setTimeout(() => {//保证歌曲切换至前台能正常播放js正常执行
          this.$refs.audio.play()
          this.getLyric()//获取歌词
        }, 1000)        
      },
      playing(newPlaying){ //监听playing状态
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>