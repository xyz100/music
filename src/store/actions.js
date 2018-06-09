// 通过将mutations里面处里数据的方法变成可异步的处理数据的方法
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util' 
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

//返回第一个符合条件的元素的索引位置
function findIndex(list, song){
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

//顺序播放
export const selectPlay = function ({commit, state}, {list, index}) {
	commit(types.SET_SEQUENCE_LIST, list)
  if(state.mode === playMode.random){
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  }else{
    commit(types.SET_PLAYLIST, list)
  }
	commit(types.SET_CURRENT_INDEX, index)
	commit(types.SET_FULL_SCREEN, true)
	commit(types.SET_PLAYING_STATE, true)
}

//随机播放
export const randomPlay = function({commit}, {list}){
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list) //获取随机歌曲数组
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

//插入歌曲song
export const insertSong = function({commit, state}, song){
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  //记录当前歌曲
  let currentSong = playList[currentIndex]
  //查找当前列表中是否有待插入的歌曲，并返回其索引
  let fpIndex = findIndex(playList, song)
  //因为是插入歌曲，所以索引+1
  currentIndex++
  //插入这首歌到当前索引位置
  playList.splice(currentIndex, 0, song)
  //歌曲存在，找到删掉
  if(fpIndex > -1){
    //如果当前插入的索引大于列表中的索引 删除
    if(currentIndex > fpIndex){
      playList.splice(fpIndex, 1)
      currentIndex-- //当前播放索引
    }else{
      playList.splice(fpIndex + 1, 1)
    }
  }

  let currentSIndex = findIndex(sequenceList, currentSong) + 1

  let fsIndex = findIndex(sequenceList, song)

  sequenceList.splice(currentSIndex, 0, song)

  //不需要计算currentSIndex，只需确定位置就行
  if(fsIndex > -1){
    if(currentSIndex > fsIndex){
      sequenceList.splice(fsIndex, 1)
    }else{
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

//search搜索结果保存到缓存中localStorage
export const saveSearchHistory = function({commit}, query){
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

//删除一个历史记录
export const deleteSearchHistory = function({commit}, query){
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

//删除所有历史记录
export const clearSearchHistory = function({commit}){
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function({commit, state}, song){
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playList, song)
  playList.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if(currentIndex > pIndex || currentIndex === playList.length){
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  const playingState = playList.length > 0
  commit(types.SET_PLAYING_STATE, playingState)

  // if(!playList.length){
  //   commit(types.SET_PLAYING_STATE, false)
  // }else{
  //   commit(types.SET_PLAYING_STATE, true)
  // }
}

export const deleteSongList = function({commit}){
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function({commit}, song){
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function({commit}, song){
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function({commit}, song){
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}