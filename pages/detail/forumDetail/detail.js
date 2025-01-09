import request from '@/utils/request';

Page({
  data: {
    detail: {}, // 存储论坛详情
    categoryId: '', // 当前分类ID（传递的id会改为categoryId）
    comments: [], // 评论列表
    commentsCount: 0, // 评论总数
    commentContent: '', // 用户输入的评论内容
    currentPage: 1, // 当前页码
    pageSize: 10, // 每页显示的评论数
    hasMoreComments: true, // 是否有更多评论
  },

  onLoad(options) {
    const { id } = options; // 从页面参数获取论坛ID

    if (id) {
      this.setData({ categoryId: id });
      this.getForumDetail(id);  // 使用 categoryId 请求详情
      this.getComments(id);  // 获取评论列表
    } else {
      wx.showToast({
        title: '无效的论坛ID',
        icon: 'none',
      });
    }
  },

  // 获取论坛详情
  getForumDetail(categoryId) {
    wx.showLoading({ title: '加载中...' });

    request.post('/forum/forumInfo/detail', { forumId: categoryId })
      .then((response) => {
        wx.hideLoading();
        const { success, data, message } = response;

        if (success) {
          this.setData({ detail: data });
        } else {
          wx.showToast({
            title: message || '详情加载失败',
            icon: 'none',
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
      });
  },

 // 获取评论列表
 getComments(forumId) {
  wx.showLoading({ title: '加载评论中...' });

  const { currentPage, pageSize } = this.data;
  const memberId = getApp().getMemberId(); // 获取全局 memberId

  request.post('/forum/forumComment/list', {
    forumId,
    current: currentPage,
    size: pageSize,
  })
    .then((response) => {
      wx.hideLoading();
      const { success, data, message, errorCode } = response;
      if (errorCode === 20000) {
        // 获取评论数据（data.records是评论列表）
        const newComments = data.records.map((comment) => {
          console.log(comment.memberId === memberId);
          return {
              ...comment,
              canDelete: comment.memberId === memberId, // 判断评论是否可以删除
              children: this.processNestedComments(comment.children, memberId), // 递归处理子评论
          }
      });
        // 更新评论总数
        const commentsCount = data.total;
        
        // 更新评论列表和评论总数
        this.setData({ 
          comments: newComments,  // 设置评论列表
          commentsCount: commentsCount  // 设置评论总数
        });

        // 判断是否还有更多评论
        if (newComments.length < pageSize) {
          this.setData({ hasMoreComments: false });
        } else {
          this.setData({ hasMoreComments: true });
        }
      } else {
        wx.showToast({
          title: message || '评论加载失败',
          icon: 'none',
        });
      }
    })
    .catch((error) => {
      wx.hideLoading();
      console.error('获取评论失败：', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
      });
    });
},
// 递归处理子评论和孙评论
processNestedComments(comments, memberId) {
  if (!comments) return []; // 如果没有子评论，直接返回空数组

  return comments.map((comment) => {
    return {
      ...comment,
      canDelete: comment.userId === memberId, // 判断当前评论是否可以删除
      children: this.processNestedComments(comment.children, memberId), // 递归处理孙评论
    };
  });
},
  // 监听评论输入框的输入
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value,
    });
  },

  // 发布评论
  publishComment() {
    const { commentContent, categoryId } = this.data;

    if (!commentContent.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({ title: '发布中...' });

    request.post('/forum/forumComment/publish', {
      forumId: categoryId,
      content: commentContent,
    })
      .then((response) => {
        wx.hideLoading();
        const { success, message } = response;

        if (success) {
          // 清空输入框
          this.setData({ commentContent: '' });
          // 更新评论列表
          this.setData({ currentPage: 1 }); // 重置为第一页
          this.getComments(categoryId);
        } else {
          wx.showToast({
            title: message || '发布失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('发布评论失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
  // 删除评论
  deleteComment(commentId) {
    wx.showLoading({ title: '删除中...' });

    request.post('/forum/forumComment/delete', { commentId })
      .then((response) => {
        wx.hideLoading();
        const { success, message } = response;

        if (success) {
          wx.showToast({
            title: '评论删除成功',
            icon: 'none',
          });
          // 删除后重新获取评论列表
          const { categoryId } = this.data;
          this.setData({ currentPage: 1 }); // 重置为第一页
          this.getComments(categoryId);
        } else {
          wx.showToast({
            title: message || '删除失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('删除评论失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },

  // 点击删除评论
  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '是否删除该评论？',
      success: (res) => {
        if (res.confirm) {
          this.deleteComment(id);
        }
      },
    });
  },

  // 加载更多评论
  loadMoreComments() {
    console.log("执行到这")
    const { categoryId, currentPage, hasMoreComments } = this.data;
    if (hasMoreComments) {
      this.setData({ currentPage: currentPage + 1 });
      this.getComments(categoryId); // 获取下一页评论
    } else {
      wx.showToast({
        title: '没有更多评论了',
        icon: 'none',
      });
    }
  },
});
