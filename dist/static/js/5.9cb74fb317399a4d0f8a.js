webpackJsonp([5],{"35Kg":function(t,n){},BRgg:function(t,n,i){"use strict";n.b=function(){var t=a()({},r.b,{uin:0,needNewCode:1,platform:"h5",g_tk:938407465});return Object(c.a)("https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg",t,r.c)},n.a=function(t){var n=a()({},r.b,s()({topid:t,needNewCode:1,tpl:3,page:"detail",type:"top",platform:"h5"},"page","detail"));return Object(c.a)("https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg",n,r.c)};var e=i("a3Yh"),s=i.n(e),o=i("aA9S"),a=i.n(o),c=i("Gak4"),r=i("T452")},s3x3:function(t,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e=i("4YfN"),s=i.n(e),o=i("kvay"),a=i("9rMa"),c=i("BRgg"),r=i("T452"),u=i("PvFA"),g={computed:s()({title:function(){return this.topList.topTitle},bgImage:function(){return this.songs.length?this.songs[0].image:""}},Object(a.c)(["topList"])),created:function(){this._getMusicList()},data:function(){return{songs:[],rank:!0}},methods:{_getMusicList:function(){var t=this;this.topList.id?Object(c.a)(this.topList.id).then(function(n){r.a===n.code&&(t.songs=t._normalizeSongs(n.songlist))}):this.$router.push("/rank")},_normalizeSongs:function(t){var n=[];return t.forEach(function(t){var i=t.data;i.songid&&i.albumid&&n.push(Object(u.a)(i))}),n}},components:{MusicList:o.a}},f={render:function(){var t=this.$createElement,n=this._self._c||t;return n("transition",[n("music-list",{attrs:{rank:this.rank,title:this.title,"bg-image":this.bgImage,songs:this.songs}})],1)},staticRenderFns:[]};var p=i("Z0/y")(g,f,!1,function(t){i("35Kg")},"data-v-3f857504",null);n.default=p.exports}});
//# sourceMappingURL=5.9cb74fb317399a4d0f8a.js.map