
import request from '@/utils/request'
import {
  validateForm,
  isLogin
} from '@/utils/common'
Page({
  data: {
    oldphone: '',
    phone: '',
    birthday: '',
    code: '',
    sex: '', // 性别，1男，0女
    countdown: 60,
    timer: null,
    getMessageText: '发送验证码',
    modifyingFlag: true,
    canModifyBirthday: true,
  },

  onUnload() {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  back() {
    wx.navigateBack();
  },

  onClickShowModify() {
    this.setData({ modifyingFlag: false });
  },

  onClickClearBirthday() {
    this.setData({ birthday: '' });
  },

  onClickClearCode() {
    this.setData({ code: '' });
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
    } else {
      this.setData({
        getMessageText: `${this.data.countdown}s后重发`,
        countdown: this.data.countdown - 1,
      });
    }

    this.data.timer = setTimeout(() => {
      this.beginSetTime();
    }, 1000);
  },

  // 获取验证码按钮点击事件
  getSendSms() {
    const phone = this.data.phone;
    if (!phone) {
      wx.showToast({
        title: '手机号码不能为空',
        icon: 'none',
      });
      return false;
    }
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '手机号码格式错误',
        icon: 'none',
      });
      return false;
    }
    this.beginSetTime();
    wx.request({
      url: `${config.api_base_url_tools}sms`,
      method: 'POST',
      data: {
        sender: 'member',
        flag: 'updatePhone',
        phone: phone,
      },
      success: (res) => {
        const { status } = res.data;
        if (status.flag === true) {
          wx.showToast({
            icon: 'none',
            title: '发送成功',
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: status.msg,
          });
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '发送失败, 网络异常',
        });
      },
    });
  },

  getDate(type) {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (type === 'start') {
      year -= 60;
    } else if (type === 'end') {
      year += 2;
    }
    month = month > 9 ? month : '0' + month;
    day = day > 9 ? day : '0' + day;
    return `${year}-${month}-${day}`;
  },

  bindDateChange(e) {
    this.setData({ birthday: e.detail.value });
  },

  selectSex(sex) {
    this.setData({ sex });
  },

  _findMemberDetail() {
    const authorization = wx.getStorageSync('authorization');
    wx.showLoading({ title: '加载中' });
    request({
      url: "sso/member/findByToken",
      header: { AUTH: authorization.token },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag === true) {
          this.setData({
            oldphone: data.phone || '',
            birthday: data.birthday || '',
            sex: data.sex,
            canModifyBirthday: !data.birthday,
          });
        } else {
          wx.showToast({
            title: status.msg,
            icon: 'none',
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络异常, 暂时不能查询',
          icon: 'none',
        });
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  },

  updateBirthdayOrSex() {
    const authorization = wx.getStorageSync('authorization');
    wx.showLoading({ title: '加载中' });

    if (this.data.modifyingFlag) {
      const obj = {};
      if (this.data.canModifyBirthday && this.data.birthday) {
        obj.birthday = this.data.birthday;
      }
      if (['0', '1'].includes(this.data.sex)) {
        obj.sex = this.data.sex;
      }
      request({
        url: "/sso/member/update",
        method: 'PUT',
        data: obj,
        header: { AUTH: authorization.token },
        success: (res) => {
          const { status } = res.data;
          if (status.flag === true) {
            wx.showToast({ title: '修改成功', icon: 'none' });
            this._findMemberDetail();
          } else {
            wx.showToast({ title: status.msg, icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({
            title: '修改失败, 网络异常',
            icon: 'none',
          });
        },
        complete: () => {
          wx.hideLoading();
        },
      });
    }
  },
  _getInfoByToken() {
    //判断是否已经登录
    isLogin()

    request({
      url: `/sso/member/findByToken`,
    }).then(res => {
      const {success,data,message} = res
      if (success) {
        this.user = data
      } else {
        wx.showToast({
          icon: 'none',
          title: message
        })
      }
    })
  },
});
