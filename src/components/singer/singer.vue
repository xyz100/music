<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" @select="selectSinger" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
	import {getSingerList} from 'api/singer'
	import {ERR_OK} from 'api/config'
	import Singer from 'common/js/singer'
	import ListView from 'base/listview/listview'
	import {mapMutations} from 'vuex'
	import {playListMixin} from 'common/js/mixin'

	const HOT_NAME = '热门'
	const HOT_SINGER_LEN = 10

	export default {
		mixins: [playListMixin],//插入到组件中
		data(){
			return {
				singers: []
			}
		},
		created() {
			this._getSingerList()
		},
		methods: {
			handlePlayList(playList){
        const bottom = playList.length > 0 ? '60px' : ''
        // console.log(bottom)
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
			selectSinger(singer) {
				this.$router.push({
					path: `/singer/${singer.id}`
				})
				this.setSinger(singer)//将item(选中的那首歌)存入到state里面
			},
			_getSingerList() {
				getSingerList().then((res) => {
					if(res.code === ERR_OK) {
						this.singers = this._normalizeSinger(res.data.list)
					}
				})
			},
			_normalizeSinger(list) {
				let map = {
					hot: {
						title: HOT_NAME,
						items: []
					}
				}
				list.forEach((item, index) => {
					if(index < HOT_SINGER_LEN){ //前10个放入热门列表里
						map.hot.items.push(new Singer({
							id: item.Fsinger_mid,
							name: item.Fsinger_name
						}))
					}
					const key = item.Findex
					if(!map[key]){
						map[key] = {
							title: key,
							items: []
						}
					}
					map[key].items.push(new Singer({
						id: item.Fsinger_mid,
						name: item.Fsinger_name
					}))
				})
				//为了得到有序列表，需要处理map
				let hot = []
				let ret = []
				for(let key in map){
					let val = map[key]
					if(val.title.match(/[a-zA-Z]/)){
						ret.push(val)
					}else if(val.title === HOT_NAME){
						hot.push(val)
					}
				}
				ret.sort((a, b) =>{ //升序
					return a.title.charCodeAt(0) - b.title.charCodeAt(0)
				})
				return hot.concat(ret)
			},
			//向state里面存储数据,方法名，执行mutation-types里面的什么的操作，实际执行的是mutations的方法
			...mapMutations({
				setSinger: 'SET_SINGER'
			})
		},
		components: {
			ListView
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	.singer
		position: fixed
		top: 88px
		bottom: 0
		width: 100%
</style>
