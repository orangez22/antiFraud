import request from '@/utils/request'
import { isLogin } from '@/utils/common'

Page({
  data: {
    name: '',
    age: '',
    gender: '', // 性别，1男，0女
    address: '',
    avatar: '', // 头像
  },

  onLoad() {
    this._getInfoById(); // 获取会员详情
  },

  // 获取全局 memberId
  getMemberId() {
    const app = getApp(); // 获取全局 app 实例
    return app.getMemberId(); // 获取 memberId
  },

 // 获取会员详情
_getInfoById() {
  const authorization = wx.getStorageSync('authorization');
  wx.showLoading({ title: '加载中' });

  const memberId = this.getMemberId(); // 获取 memberId
  request({
    url: `/member/memberInfo/${memberId}`, // 使用 memberId 获取会员信息
    method: 'GET',
    header: { AUTH: authorization.token }, // 设置 authorization token
  
    success: (res) => {
      console.log("请求成功，返回的内容：", res);
      const { errorCode, data } = res.data;  // 解构返回数据
      console.log("返回的值为:", res.data);  // 打印调试用
      // 检查返回的 errorCode 是否是 20000 (成功)
      if (errorCode === 20000) {
        console.log("成功")
        // 成功返回会员信息，设置页面数据
        this.setData({
          name: data.name,
          age: data.age,
          gender: data.gender,
          address: data.address,
          avatar: data.avatar,
        });
      } else {
        // 如果 errorCode 不是 20000，表示返回失败，弹出提示
        wx.showToast({
          title: res.data.message || '获取会员信息失败',
          icon: 'none',
        });
      }
    },
    fail: (error) => {
      console.error("请求失败:", error);  // 打印失败信息
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
  // 更新用户信息
  // 获取会员详情
_getInfoById() {
  const authorization = wx.getStorageSync('authorization');
  wx.showLoading({ title: '加载中' });

  const memberId = this.getMemberId(); // 获取 memberId
  request({
    url: `/member/memberInfo/${memberId}`, // 使用 memberId 获取会员信息
    method: 'GET',
    header: { AUTH: authorization.token }, // 设置 authorization token
  })
  .then((res) => {
    const { errorCode, data } = res.data;  // 解构返回数据
    // 检查返回的 errorCode 是否是 20000 (成功)
    if (res.errorCode === 20000) {
      // 成功返回会员信息，设置页面数据
      this.setData({
        name: res.data.name,
        age: res.data.age,
        gender: res.data.gender,
        address: res.data.address,
        avatar: res.data.avatar,
      });
    } else {
      // 如果 errorCode 不是 20000，表示返回失败，弹出提示
      wx.showToast({
        title: res.data.message || '获取会员信息失败',
        icon: 'none',
      });
    }
  })
  .catch((error) => {
    console.error("请求失败:", error);  // 打印失败信息
    wx.showToast({
      title: '网络异常, 暂时不能查询',
      icon: 'none',
    });
  })
  .finally(() => {
    wx.hideLoading(); // 请求完成后隐藏加载中提示
  });
},

// 更新用户信息
updateMemberInfo() {
  const authorization = wx.getStorageSync('authorization');
  const memberId = this.getMemberId(); // 获取全局的 memberId

  wx.showLoading({ title: '保存中' });

  const obj = {
    memberId: memberId, // 添加 memberId
    name: this.data.name,
    age: this.data.age,
    gender: this.data.gender,
    address: this.data.address,
    avatar: this.data.avatar,
  };

  request({
    url: "/member/memberInfo/update", // 后端更新接口
    method: 'POST',
    data: obj,
    header: { AUTH: authorization.token },
  })
  .then((res) => {
    if (res.errorCode===20000) {
      // 显示保存成功提示
      wx.showToast({ title: '保存成功', icon: 'success' });

      // 延迟返回上一页（可以根据需要设置延迟时间）
      setTimeout(() => {
        wx.navigateBack(); // 返回到上一个页面
      }, 1000); // 1秒后返回
    } else {
      wx.showToast({ title: status.msg, icon: 'none' });
    }
  })
  .catch(() => {
    wx.showToast({
      title: '修改失败, 网络异常',
      icon: 'none',
    });
  })
  .finally(() => {
    wx.hideLoading(); // 请求完成后隐藏加载中提示
  });
},


  // 处理姓名输入
  handleNameInput(e) {
    this.setData({
      name: e.detail.value,
    });
  },

  // 处理年龄输入
  handleAgeInput(e) {
    this.setData({
      age: e.detail.value,
    });
  },

  // 处理地址输入
  handleAddressInput(e) {
    this.setData({
      address: e.detail.value,
    });
  },

  // 选择性别
  selectSex(e) {
    this.setData({
      gender: e.currentTarget.dataset.value,
    });
  },
   // 前端选择头像并上传
chooseAvatarImage(type) {
  wx.chooseMedia({
    count: 1, // 选择 1 张图片或视频
    mediaType: ['image'], // 指定选择的媒体类型为图片
    sourceType: ['album', 'camera'], // 可选择相册或相机
    success: (res) => {
      const tempFilePath = res.tempFiles[0].tempFilePath; // 获取选择的图片路径
      this.setData({
        [type]: tempFilePath,
      });

      // 可选：上传图片到服务器
      this.uploadToServer(tempFilePath);
    },
    fail: () => {
      wx.showToast({
        title: '选择图片失败',
        icon: 'none',
      });
    },
  });
},

// 上传图片到后端
uploadToServer(filePath) {
  wx.uploadFile({
    url: '/member/upload',  // 假设这是后端处理上传的接口
    filePath: filePath,
    name: 'file', // 上传文件时的字段名
    formData: {
      memberId: this.getMemberId(),  // 附带会员ID等其他参数
    },
    success: (res) => {
      const data = JSON.parse(res.data);
      if (data.success) {
        this.setData({
          avatar: data.url,  // 更新显示的头像 URL
        });
        wx.showToast({ title: '头像更新成功', icon: 'success' });
      } else {
        wx.showToast({ title: '头像上传失败', icon: 'none' });
      }
    },
    fail: (error) => {
      console.error("上传失败错误信息：", error);  // 打印失败信息
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    },
  });
},
  // 保存按钮点击事件
  saveProfile() {
    this.updateMemberInfo(); // 保存用户信息
  },
});
