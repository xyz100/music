<template>
  <transition><!-- 排行榜详情页 -->
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default{
    computed:{
      title(){
        return this.topList.topTitle
      },
      bgImage(){
        if(this.songs.length){
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    created(){
      this._getMusicList()
    },
    data(){
      return {
        songs: [],
        rank: true
      }
    },
    methods:{
      _getMusicList(){
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if(ERR_OK === res.code){
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      //將data转化成song的实例后就可以用了
      _normalizeSongs(list){
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if(musicData.songid && musicData.albumid){
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components:{
      MusicList
    }
  }
</script>
<style scoped lang="stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>