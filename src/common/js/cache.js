// 缓存localStorage
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15 //最多存储15条数据

const PLAY_KEY = '__play__' //播放列表存储
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__' //收藏列表
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) { //第一条数据
    return
  }
  if (index > 0) {
    arr.splice(index, 1) //删掉之前的数据
  }
  arr.unshift(val) //放在数据第一位
  if (maxLen && arr.length > maxLen) { //超过数组长度15
    arr.pop() //数组最后一个pop出来
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

//将query插入到当前历史列表中，保存，return
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query //query在数组中
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function savePlay(song){
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay() {
  return storage.get(PLAY_KEY, []) //读
}

//收藏
export function saveFavorite(song){
  //拿到当前所有收藏的歌曲列表
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

//state初始值获取的时候用
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
