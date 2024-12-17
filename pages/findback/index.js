// pages/findback/index.js
import request from '@/utils/request';
import { validateForm, isLogin } from '@/utils/common';
import { setToken, getToken, setId } from '@/utils/auth';
Page({
  data: {
    phone: '',
    messageCode: '',
    pass: '',
    timer: null,
    countdown: 60,
    getMessageText: '发送验证码',
  },

  // 页面卸载时清除定时器
  onUnload() {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  // 返回上一页
  back() {
    wx.navigateBack();
  },

  // 倒计时操作
  beginSetTime() {
    if (this.data.countdown === 0) {
      this.setData({
        getMessageText: '发送验证码',
        countdown: 60,
        timer: null,
      });
      return;
    }

    this.setData({
      getMessageText: `${this.data.countdown}s后重发`,
      countdown: this.data.countdown - 1,
    });

    this.data.timer = setTimeout(() => {
      this.beginSetTime();
    }, 1000);
  },

  // 发送验证码操作
  onClickSendCode() {
    if (this.data.timer) {
      return;
    }

    const phone = this.data.phone;
    if (!phone) {
      wx.showToast({
        title: '手机号码不能为空',
        icon: 'none',
      });
      return;
    }
    if (!/^1[34578]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '手机号码格式错误',
        icon: 'none',
      });
      return;
    }

    this.beginSetTime();
  
    request({
      url: '/sso/member/getCode',
      method: 'POST',
      data: { phone: this.data.phone, type: 'login' }
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

  // 修改密码操作
  updatePass() {
    const { phone, pass, messageCode } = this.data;

    if (!phone) {
      wx.showToast({
        title: '手机号码不能为空',
        icon: 'none',
      });
      return;
    }
    if (!pass) {
      wx.showToast({
        title: '新密码不能为空',
        icon: 'none',
      });
      return;
    }
    if (!messageCode) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '加载中',
    });
    request({
      url: '/sso/member/findPassword',
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        phone: phone,
        password: pass,
        code:messageCode
      },
      success: (res) => {
        const { status } = res.data;
        if (status.flag) {
          wx.showToast({
            title: '修改密码成功',
            icon: 'none',
          });
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/phone/pwd/index',
            });
          }, 777);
        } else {
          wx.showToast({
            title: status.msg,
            icon: 'none',
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '修改密码失败, 网络异常',
          icon: 'none',
        });
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  },

  // 输入框操作
  onInputPhone(e) {
    this.setData({ phone: e.detail.value });
  },
  onInputMessageCode(e) {
    this.setData({ messageCode: e.detail.value });
  },
  onInputPass(e) {
    this.setData({ pass: e.detail.value });
  },
});
