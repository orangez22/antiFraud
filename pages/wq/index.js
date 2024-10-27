// pages/wq/index.js
Page({

  data: {

  },

  handleTest:function(){
      //console.log("我被点击了")
      wx.login({
        success: (res) => {
          console.log(res.code)
          wx.request({
            url: 'http://localhost:8080/member/loginByWeChat',
            method:'POST',
            data:{'code':res.code},
            success(response){
                console.log(response.data)
            },
          })
        },
      })
     
  }


})