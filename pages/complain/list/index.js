// pages/complain/list/index.js
Page({
  data: {
    h5ListHeight: 0,
    currentIndex: '',
    allPage: 1,
    allSize: 10,
    allList: [],
    allTotal: 0,
    allTotalPage: 0,
  },

  onLoad: function () {
    let authorization = wx.getStorageSync('authorization');
    if (Object.keys(authorization).length == 0) {
      wx.showToast({
        icon: 'none',
        title: '尚未登录, 请先登录'
      });
      setTimeout(() => {
        wx.removeStorageSync('authorization');
        wx.reLaunch({
          url: '../verificationcodelogin/verificationcodelogin'
        });
      }, 777);
      return false;
    }
    // 获取数据
    this._getAllComplainData('');
  },

  onReady: function () {
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        let info = wx.createSelectorQuery().select(".complain-title");
        info.boundingClientRect(function (data) {
          that.setData({
            h5ListHeight: res.windowHeight - data.height
          });
        }).exec();
      }
    });
  },

  onPullDownRefresh: function () {
    this.setData({
      allPage: 1,
      allSize: 10,
      allList: [],
      allTotal: 0,
      allTotalPage: 0
    });
    this._getAllComplainData(this.data.currentIndex);
  },

  methods: {
    back: function () {
      wx.navigateBack();
    },

    pageTotal: function (rowCount, pageSize) {
      if (rowCount === null || rowCount === "") {
        return 0;
      } else {
        if ((pageSize !== 0) && (rowCount % pageSize === 0)) {
          return parseInt(rowCount / pageSize);
        }
        if ((pageSize !== 0) && (rowCount % pageSize !== 0)) {
          return parseInt(rowCount / pageSize) + 1;
        }
      }
    },

    _getAllComplainData: function (status) {
      let authorization = wx.getStorageSync('authorization');
      let req = {};
      if (status != '') {
        req.status = status;
      }

      const allPage = this.data.allPage;
      const allSize = this.data.allSize;
      wx.request({
        url: `${config.api_base_url}member/complaint/${allPage}/${allSize}`,
        header: {
          'AUTH': authorization.token,
        },
        data: req,
        method: 'POST',
        success: (res) => {
          const { status, data } = res.data;
          if (status.flag === true) {
            this.setData({
              allTotal: data.total,
              allTotalPage: this.pageTotal(data.total, allSize)
            });
            if (status === this.data.currentIndex) {
              this.setData({
                currentIndex: status,
                allList: this.data.allList.concat(data.rows)
              });
            } else {
              this.setData({
                allList: data.rows
              });
            }
          } else {
            this.setData({
              allTotal: 0,
              allTotalPage: this.pageTotal(0, allSize),
              allList: []
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: "网络异常, 请求失败",
            icon: "none"
          });
        },
        complete: () => {
          wx.stopPullDownRefresh();
        }
      });
    },

    allScrolltolower: function () {
      const page1 = this.data.allPage + 1;
      const totalPage = this.data.allTotalPage;
      if (page1 <= totalPage) {
        this.setData({
          allPage: page1
        });
        this._getAllComplainData(this.data.currentIndex);
      } else {
        wx.showToast({
          title: '已经到底部了',
          icon: 'none'
        });
      }
    },

    selectIndex: function (e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.currentIndex) {
        return false;
      }
      this.setData({
        currentIndex: index
      });
      this._getAllComplainData(index);
    }
  }
});
