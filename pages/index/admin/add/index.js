import request from '@/utils/request';  // 导入请求模块

Page({
  data: {
    title: '',   // 标题
    content: '', // 内容
    author: '',  // 作者
    image: '',   // 图片链接
  },

  // 页面加载时获取数据
  onLoad() {
    this.loadData();
  },

  // 输入框处理
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },
  onAuthorInput(e) {
    this.setData({ author: e.detail.value });
  },

  // 选择图片
  onImageInput() {
    wx.chooseImage({
      count: 1,  // 选择1张图片
      sizeType: ['original', 'compressed'],  // 图片大小：原图和压缩图
      sourceType: ['album', 'camera'],  // 可选择相册或相机
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];  // 获取图片路径
        this.setData({ image: tempFilePath });  // 设置到页面数据中
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      },
    });
  },

  // 提交表单
  onSubmit() {
    const { title, content, author, image } = this.data;

    // 检查必填项
    if (!title || !content || !author || !image) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none',
      });
      return;
    }

    // 获取当前时间
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // 获取当前时间并格式化为 "yyyy-MM-dd HH:mm:ss"

    // 上传图片
    this.uploadImage(image).then((imageUrl) => {
      // 创建发布数据对象
      const publishData = {
        title,
        content,
        author,
        image: imageUrl,  // 使用上传后的图片URL
        date: currentTime, // 当前时间
      };

      // 调用后端发布接口
      request.post('/list/publish', publishData)
        .then((response) => {
          if (response.success) {
            wx.showToast({
              title: '发布成功',
              icon: 'success',
            });
            // 返回到上一个页面
            wx.navigateBack();
          } else {
            wx.showToast({
              title: '发布失败',
              icon: 'none',
            });
          }
        })
        .catch((error) => {
          wx.showToast({
            title: '请求失败',
            icon: 'none',
          });
        });
    }).catch(() => {
      wx.showToast({
        title: '图片上传失败',
        icon: 'none',
      });
    });
  },

  // 上传图片
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'http://localhost:28080/list/upload',
        method: 'POST',
        filePath: filePath,
        name: 'file',
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data.data.url);  // 返回上传后的图片 URL
          } else {
            reject('图片上传失败');
          }
        },
        fail: () => {
          reject('图片上传失败');
        }
      });
    });
  },

  // 上传附件
  uploadAttachment(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'http://localhost:28080/list/upload', // 后端接收上传附件的接口
        method: 'POST',
        filePath: filePath,
        name: 'file',  // 后端接收的字段名
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data.data.url);  // 返回附件的 URL
          } else {
            reject('附件上传失败');
          }
        },
        fail: () => {
          reject('附件上传失败');
        }
      });
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 模拟网络请求获取数据
    this.loadData();
  },

  // 加载数据
  loadData() {
    // 假设你要从服务器获取数据
    request.get('/list/data')
      .then((response) => {
        // 更新页面数据
        this.setData({
          title: response.data.title,
          content: response.data.content,
          author: response.data.author,
          image: response.data.image,
        });

        // 结束下拉刷新
        wx.stopPullDownRefresh();
      })
      .catch(() => {
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
        });
      });
  },
});
