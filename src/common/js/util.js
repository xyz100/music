// 将歌曲顺序打乱,返回一个随机数组
// 返回[min, max]之间的一个整数
function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr){
  let _arr = arr.slice()
  for(let i=0; i<_arr.length; i++){
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return arr
}

//截流函数，防止search-box里的watch频繁触发query,返回一个新的函数
export function debounce(func, delay){
  let timer
  return function(...args){
    if(timer){//函数被执行
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}