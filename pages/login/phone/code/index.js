// pages/login/phone/code/index.js
import request from '@/utils/request';
import {
  validateForm
} from '@/utils/common';

Page({
      /**
       * 页面的初始数据
       */
      data: {
        phone: '13812341234',
        countdown: 60,
        getMessageText: '发送验证码',
        timer: null,
        code: ''
      },

      /**
       * 生命周期函数--监听页面卸载
       */
      onUnload() {
        if (this.data.timer) {
          clearTimeout(this.data.timer);
        }
      },

      // 表单校验规则
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

      // 倒计时操作
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

      // 获取验证码按钮点击事件
      getSendSms() {
        if (this.data.timer) {
          return;
        }
  
        this.beginSetTime();
        request({
          url: `/member/getCode/${this.data.phone}`,
          method: 'GET'
        }).then(res => {
          const {
            success,
            message
          } = res;
          if (success) {
            wx.showToast({
              title: '短信发送成功',
            });
          }
        }).catch(err => {
          wx.showToast({
            title: '网络异常，无法获取验证码',
            icon: 'error'
          });
        });
      },

    // 短信登录方法
messagelogin() {
  const data = {
    phone: this.data.phone,
    code: this.data.code
  };
  validateForm(data, this.rules)
    .then(() => {
      wx.showLoading({
        title: '登录中...'
      });
      request({
        url: `/member/login/phone`,
        method: 'POST',
        data: data
      }).then(res => {
        const { success, data } = res;
        if (success) {
          wx.setStorageSync('token', data.token);
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          wx.switchTab({
            url: "/pages/my/index"
          });
        } else {
          wx.showToast({
            title: data.message || '登录失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.log(err);
        wx.showToast({
          title: '网络错误',
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
}
  ,

  // 跳转到使用账号和密码登录页面
  goLoginPage() {
    wx.redirectTo({
      url: '../login/login'
    });
  },

  // 输入框绑定
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  }
});