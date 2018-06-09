<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
        	<Slider>
        		<div v-for="item in recommends">
        			<a :href="item.linkUrl">
        				<img :src="item.picUrl">
        			</a>
        		</div>
        	</Slider>	
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
              <!-- class="needsclick" -->
                <img class="needsclick"  @load="loadImage" v-lazy="item.imgurl" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name">{{item.creator.name}}</h2>
                <p class="desc">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <Loading></Loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
	import Slider from 'base/slider/slider'
	import {getRecommend, getDiscList} from 'api/recommend'
	import {ERR_OK} from 'api/config'
  import Loading from 'base/loading/loading'
  import {playListMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

	export default{
    mixins: [playListMixin],
		data() {
			return {
				recommends: [],
        discList: []
			}
		},
		created() {
			this._getRecommend()
      this._getDiscList()
		},
		methods: {
      handlePlayList(playList){
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem(item){
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
        console.log(item)
      },
			_getRecommend() {
				getRecommend().then((res) => {
					if(res.code === ERR_OK){  //访问成功code=0
						this.recommends = res.data.slider
            // console.log(this.recommends)
					}
				})
			},
      // 通过代理抓数据接口
      _getDiscList() {
        getDiscList().then((res) => {
          if(res.code === ERR_OK){
            this.discList = res.data.list
          }
        })
      },
      loadImage() {
        if(!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true //loadImage只调用一次
        } 
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
		},
		components: {
			Slider,
      Scroll,
      Loading
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>