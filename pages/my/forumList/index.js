import request from '@/utils/request';

Page({
  data: {
    forumList: [], // 论坛列表数据
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 用户输入的跳转页码
    memberId: 0, // 用户ID
  },

  onLoad() {
    const app = getApp();
    const memberId = app.getMemberId(); // 从全局方法获取用户ID

    if (!memberId) {
      wx.showToast({
        title: '用户未登录',
        icon: 'none',
      });
      // 跳转到登录页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/phone/code/index', // 替换为你的登录页面路径
        });
      }, 1500);
      return;
    }

    this.setData({ memberId });
    this.getForumList(); // 加载自己的论坛列表
    wx.setNavigationBarTitle({
      title: '我的论坛列表',
    });
  },

  // 获取自己的论坛列表
  getForumList() {
    const { currentPage, pageSize, memberId } = this.data;

    wx.showLoading({ title: '加载中' });

    // 构造请求参数
    const forumOwnListDTO = {
      current: currentPage,
      size: pageSize,
    };

    request.post('/forum/forumInfo/getOwnForumList', forumOwnListDTO)
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            forumList: data.records || [],
            totalPages: data.totalPages || 1,
          });
        } else {
          wx.showToast({
            title: message || '加载失败',
            icon: 'none',
          });
          this.setData({
            forumList: [],
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('请求失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
        this.setData({
          forumList: [],
        });
      });
  },

  goToDetail(e) {
    // 获取论坛帖子的 ID
    const forumId = e.currentTarget.dataset.id; 
    console.log(e.currentTarget.dataset.id)
    if (!forumId) {
      wx.showToast({
        title: '无效的论坛ID',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/detail/forumDetail/detail?id=${forumId}`, // 传递 forumId 到详情页
    });
  },

  updateCategory(e) {
    // 获取论坛帖子的 ID
    const forumId = e.currentTarget.dataset.id; 
    console.log(e.currentTarget.dataset.id)
    if (!forumId) {
      wx.showToast({
        title: '无效的论坛ID',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/my/forumList/updateForum/index?id=${forumId}`, // 传递 forumId 到更新页
    });
  },
  // 删除论坛
  deleteCategory(event) {
    const forumId = event.currentTarget.dataset.id; 
    const categoryId = event.currentTarget.dataset.categoryId; 
    // 发送删除请求，直接传递分类 ID
    request.post('/forum/forumInfo/delete', {forumId,categoryId})
      .then((response) => {
        const { success, errorCode, message } = response;
        if (errorCode === 20000) {
          console.log("论坛删除成功");
          // 删除成功后重新加载论坛数据
          this.getForumList();
        } else {
          console.error("删除论坛失败:", message || "未知错误");
        }
      })
      .catch((error) => {
        console.error("删除论坛请求失败，错误信息：", error);
      });
  },

  // 输入跳转页码
  onInputPageChange(e) {
    const goToPage = parseInt(e.detail.value) || 1;
    this.setData({ goToPage });
  },

  // 跳转到指定页码
  onGoToPage() {
    const { goToPage, totalPages } = this.data;
    const targetPage = Math.min(Math.max(goToPage, 1), totalPages);

    this.setData({ currentPage: targetPage }, () => {
      this.getForumList();
    });
  },

  // 修改每页显示条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getForumList();
    });
  },
});
