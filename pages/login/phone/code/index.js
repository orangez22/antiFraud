// pages/login/phone/code/index.js
import request from '@/utils/request';
import {
  validateForm,
  isLogin
} from '@/utils/common';
import {
  setToken,
  getToken,
  setId
} from '@/utils/auth';
import {loginApi} from "../../../../api/sso";

Page({
  data: {
    phone: '13812341234',
    countdown: 60,
    getMessageText: '发送验证码',
    timer: null,
    code: ''
  },

  onUnload() {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  onLoad() {
    let token = getToken();
    if (token) {
      wx.showToast({
        icon: 'none',
        title: '已登录,即将跳转...'
      });

      setTimeout(() => {
        wx.switchTab({
          url: "/pages/my/index"
        });
      }, 1500);
    }
  },

  rules: {
    phone: [{
      required: true,
      message: '手机号不能为空'
    },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: '手机号码格式错误'
    }
    ],
    code: [{
      required: true,
      message: '验证码不能为空'
    },
    {
      pattern: /^\d{4}$/,
      message: '验证码格式错误'
    }
    ]
  },

  beginSetTime() {
    if (this.data.countdown === 0) {
      this.setData({
        getMessageText: '发送验证码',
        countdown: 60,
        timer: null
      });
      return;
    } else {
      this.setData({
        getMessageText: `${this.data.countdown}s后重发`,
        countdown: this.data.countdown - 1
      });
    }
    this.data.timer = setTimeout(() => {
      this.beginSetTime();
    }, 1000);
  },

  getSendSms() {
    if (this.data.timer) {
      return;
    }

    this.beginSetTime();
    request({
      url: '/sso/member/getCode',
      method: 'POST',
      data: {
        phone: this.data.phone,
        type: 'login'
      }
    }).then(res => {
      wx.showToast({
        title: '短信发送成功',
      });
    }).catch(err => {
      wx.showToast({
        title: err.message || '网络异常，无法获取验证码',
        icon: 'error'
      });
    });
  },

  messagelogin() {
    const data = {
      phone: this.data.phone,
      code: this.data.code,
      type: 'verificationCodeAuthService'
    };
    validateForm(data, this.rules)
      .then(() => {
        wx.showLoading({
          title: '登录中...'
        });
        loginApi(data).then(res => {
          setToken(res.data.token);
          setId(res.data.id);
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          wx.switchTab({
            url: "/pages/my/index"
          });
        }).catch(err => {
          wx.showToast({
            title: err.message || '登录失败',
            icon: 'none'
          });
        }).finally(() => {
          wx.hideLoading();
        });
      })
      .catch(errorMsg => {
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
      });
  },

  goLoginPage() {
    wx.redirectTo({
      url: '/pages/login/phone/pwd/index'
    });
  },
  loginByWeChat() {
    wx.login({
      success(res) {
        console.log(res)
        request({
          url: '/sso/member/login',
          method: 'post',
          data: {
            'code': res.code,
            'type': 'weChatAuthService'
          }
        }).then(r => {
          console.log(r)
          const {
            data,
            success
          } = r
          if (success) {
            setToken(data.token)
            setTimeout(function () {
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
            })
            wx.switchTab({
              url: "/pages/my/index"
            });
          }
        }).catch(err => {
          console.log(err)
        })
      }
    })
  },

  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  }
});