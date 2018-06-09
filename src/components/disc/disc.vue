<template>
  <transition name="slide"><!-- 歌单详情页 -->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition> 
</template>
<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default{
    data(){
      return {
         songs: []
      }
    },
    computed:{
      title(){
        return this.disc.dissname
      },
      bgImage(){
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created(){
      this._getSongList()
    },
    methods:{
      _getSongList(){
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if(ERR_OK === res.code){
            this.songs = this._normalizeSongs(res.cdlist[0].songlist)
            // console.log(this.songs)
          }
        })
      },
      _normalizeSongs(list){//遍历每一首并创建歌曲
        let ret = []
        list.forEach((musicData) => {
          // console.log(musicData)
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