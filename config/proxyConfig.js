// vue-cli 接口代理配置
module.exports = {
  proxy: {
        '/api': {    //将www.exaple.com印射为/apis
            target: 'https://c.y.qq.com',  // 接口域名
            changeOrigin: true,  //是否跨域
            pathRewrite: {
                '^/api': ''   //需要rewrite的,
            }              
        }
  }
}