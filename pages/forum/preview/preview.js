import request from '@/utils/request';

Page({
  data: {
    forumList: [], // 初始化为空数组，待接口返回后填充
    currentPage: 1, // 当前页
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 输入框中的页码
    pageSizes: [10, 20, 30, 50], // 每页条数选择
    categoryId: 1, // 默认分类ID（根据实际情况修改）
    role: null, // 当前用户角色，管理员或普通用户
  },

  onLoad(options) {
    const { categoryId } = options; // 从页面参数获取categoryId
    const app = getApp();
    const role = app.getRole(); // 获取全局角色

    if (!role) {
      console.error('未获取到用户角色，请检查登录逻辑！');
      return;
    }

    this.setData({ 
      categoryId,
      role // 保存角色信息
    });

    if (categoryId) {
      this.getForumList(); // 根据categoryId获取论坛列表
    } else {
      wx.showToast({
        title: '无效的分类ID',
        icon: 'none',
      });
    }

    wx.setNavigationBarTitle({
      title: '论坛列表',
    });
  },

  // 获取论坛列表数据
  getForumList() {
    wx.showLoading({ title: '加载中' });

    const { currentPage, pageSize, categoryId } = this.data;

    request.post('/forum/admin/forumInfo/getForumList', { 
      categoryId, 
      current: currentPage, 
      size: pageSize 
    })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;
        // 处理返回的数据
        if (response.errorCode === 20000 && data) {
          console.log("接口返回成功，数据为：", data);
          
          // 假设返回的数据中有 `records`（数据列表）和 `total`（总条数）
          const { records, total } = data;

          // 更新数据
          this.setData({
            forumList: records || [], // 将论坛内容更新到界面
            totalPages: Math.ceil(total / pageSize), // 计算总页数
          });
        } else {
          console.error("接口返回成功但无有效数据：", message || "未知错误");
          this.setData({
            forumList: [],
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error("请求失败，错误信息：", error);
        // 请求失败时，使用空列表
        this.setData({
          forumList: [],
        });
      });
  },

  // 审批操作
  approval(e) {
    const forumId = e.currentTarget.dataset.forumId; // 获取论坛ID
    const currentStatus = e.currentTarget.dataset.status; // 获取当前状态
    const newStatus = currentStatus === '1' ? '0' : '1'; // 切换状态

    wx.showModal({
      title: '审批操作',
      content: `确定要将该帖子设置为${newStatus === '1' ? '启用' : '禁用'}吗？`,
      confirmText: newStatus === '1' ? '启用' : '禁用',
      confirmColor: newStatus === '1' ? '#4CAF50' : '#FF0000',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' });

          // 调用后端接口
          request.post('/forum/admin/forumInfo/approval', { 
            forumId, 
            status: newStatus 
          })
            .then((response) => {
              wx.hideLoading();
              if (response.success) {
                wx.showToast({ title: `${newStatus === '1' ? '启用' : '禁用'}成功`, icon: 'success' });
                this.getForumList(); // 刷新列表
              } else {
                wx.showToast({ title: response.message || '操作失败', icon: 'none' });
              }
            })
            .catch(() => {
              wx.hideLoading();
              wx.showToast({ title: '请求失败，请稍后重试', icon: 'none' });
            });
        }
      },
    });
  },

  // 点击论坛内容跳转详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取文章 ID
    wx.navigateTo({
      url: `/pages/detail/forumDetail/detail?id=${id}`,
    });
  },

  // 输入页码
  onInputPageChange(e) {
    const goToPage = parseInt(e.detail.value) || 1;
    this.setData({ goToPage });
  },

  // 跳转到指定页
  onGoToPage() {
    const goToPage = Math.min(Math.max(this.data.goToPage, 1), this.data.totalPages);
    this.setData({ currentPage: goToPage }, () => {
      this.getForumList();
    });
  },

  // 改变每页条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getForumList();
    });
  },

  // 根据角色控制按钮显示
  getRole() {
    const app = getApp();
    return app.getRole(); // 假设 getRole 是从全局 app 获取角色
  }
});
