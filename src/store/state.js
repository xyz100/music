// 跟组件模块相关的数据
import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
	singer: {},
	playing: false,
	fullScreen: false, //是否全屏
	playList: [], //播放列表
	sequenceList: [], //顺序播放
	mode: playMode.sequence, //播放模式
	currentIndex: -1, //当前播放歌曲索引
  disc: {},
  topList: {},
  searchHistory: loadSearch(), //搜索记录
  playHistory: loadPlay(), //从缓存里读取
  favoriteList: loadFavorite() //收藏列表
}

export default state