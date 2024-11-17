// pages/store/detail/index.js
Page({
  data: {
    plHeight_h5: 0,
    plHeight_app: 0,
    maxWindowHeight_h5: 0,
    maxWindowHeight_app: 0,
    id: '',
    selectIndex: 1,
    // 评论
    pl_page: 1,
    pl_size: 10,
    pl_total: 0,
    pl_totalPage: 0,
    pl_list: [],
    // 商家信息
    mystore: {},
    // 标签
    tags: [],
    // 分类列表
    categoryList: [],
    categoryCurrent: 0, // 默认是0
    // 分类对应的列表
    page: 1,
    size: 10,
    total: 0,
    totalPage: 0,
    currentList: [],
    // 处理金额和数量
    totalPrice: 0,
    totalNum: 0,
    latitude: '',
    longitude: ''
  },

  onShow() {
    // 页面显示
  },

  onHide() {
    // 离开之前的保存购物车
    // this._leaveSaveCart()
  },

  onUnload() {
    // 离开之前的保存购物车
    // this._leaveSaveCart()
  },

  methods: {
    // 判断公众号截取code
    getUrlParam(name) {
      let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      let r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      }
      return null;
    },

    onClickGotoNoVipPayPage() {
      // #ifdef H5
      let authorization = wx.getStorageSync('authorization');
      if (Object.keys(authorization).length == 0) {
        let code = this.getUrlParam('code');
        console.log(code);
        if (code) {
          wx.request({
            url: `${config.api_base_url}member/member/loginByWeChat/${code}`,
            success: res => {
              console.log(res);
              let { status, data } = res.data;
              if (status.flag === true) {
                wx.setStorageSync('authorization', {
                  'memberId': data.memberId,
                  'openId': data.openId,
                  'role': data.role,
                  'token': data.token
                })
                wx.showToast({
                  title: '登录成功',
                  icon: 'none'
                });
                wx.navigateTo({
                  url: `../offlinepay/offlinepay?storeId=${this.id}`
                })
              } else {
                wx.showToast({
                  title: status.msg,
                  icon: 'none'
                });
              }
            }
          });
        } else {
          let url = encodeURIComponent(window.location.href);
          window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${url}&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect`;
        }
      } else {
        wx.navigateTo({
          url: `../offlinepay/offlinepay?storeId=${this.id}`
        })
      }
      // #endif
    },

    back() {
      wx.navigateBack({})
    },

    // 离开之前的保存购物车
    _leaveSaveCart() {
      // 这里是分2种情况：1、有token，直接走接口；2、没有token，存在本地
      const authorization = wx.getStorageSync('authorization')
      if (authorization) {
        let obj = {}
        let goods = []
        const cartList = JSON.parse(JSON.stringify(this.cartList))
        if ((cartList != undefined) && (cartList.length)) {
          for (const item of cartList) {
            if (item.goodsId) {
              const obj = {}
              obj.goodsId = item.goodsId
              obj.goodsSum = item.goodsSum
              goods.push(obj)
            }
          }
        } else {
          goods = []
        }
        obj.goods = goods
        obj = JSON.stringify(obj)
        wx.request({
          url: `${config.api_base_url}member/cart/${this.id}`,
          method: 'PUT',
          header: {
            'AUTH': authorization.token
          },
          data: obj,
          success: ((res) => {
          }),
          fail: (() => {
            wx.showToast({
              icon: 'none',
              title: '保存失败'
            })
          })
        })
      } else {
        let storeCartList = wx.getStorageSync('storeCartList')
        if (storeCartList) {
          storeCartList = JSON.parse(storeCartList)
        } else {
          storeCartList = []
        }
        if (storeCartList.length) {

          const cartList = JSON.parse(JSON.stringify(this.cartList))
          let newCartList = []
          for (const item of cartList) {
            if (item.goodsSum > 0) {
              newCartList.push(item)
            }
          }
          if (newCartList.length) {
            storeCartList = storeCartList.concat(newCartList)
            wx.setStorageSync('storeCartList', JSON.stringify(storeCartList))
          } else {
            wx.setStorageSync('storeCartList', JSON.stringify(storeCartList))
          }
        } else {
          const cartList = JSON.parse(JSON.stringify(this.cartList))
          let newCartList = []
          for (const item of cartList) {
            if (item.goodsSum > 0) {
              newCartList.push(item)
            }
          }
          if (newCartList.length) {
            wx.setStorageSync('storeCartList', JSON.stringify(newCartList))
          }
        }
      }
    },

    // 改变本地与购物车同步
    _setStoreList(newObj) {
      // 解决当有购物车的时候，统一id的问题
      newObj.goodsId = newObj.id
      newObj.goodsPrice = newObj.price
      let cartList = JSON.parse(JSON.stringify(this.cartList))
      if ((cartList !== undefined) && (cartList.length)) {
        const result = cartList.some(item => item.goodsId === newObj.id)
        if (result) {
          if (newObj.goodsSum > 0) {
            cartList.forEach((item, index) => {
              if (item.goodsId === newObj.id) {
                item.goodsSum = newObj.goodsSum
              }
            })
          } else {
            cartList.forEach((item, index) => {
              if (item.goodsId === newObj.id) {
                item.goodsSum = 0
              }
            })
          }
        } else {
          cartList.push(newObj)
        }
      } else {
        cartList.push(newObj)
      }
      this.cartList = cartList
      this._handleTotalNumAndTotalPrice()
    },

    // 增加
    onClickAddNumById(id) {
      this.currentList.forEach(item => {
        if (item.id === id) {
          item.goodsSum += 1
        }
      })
      const res = this.currentList.filter(item => item.id === id)
      this._setStoreList(...res) // 设置本地存储
    },

    // 减少
    onClickDeducNumById(id) {
      this.currentList.forEach(item => {
        if (item.id === id) {
          item.goodsSum -= 1
        }
      })
      const res = this.currentList.filter(item => item.id === id)
      this._setStoreList(...res) // 设置本地存储
    },

    // 点击切换分类的时候
    onClickChangeCategoryCurrent(index) {
      if (index === this.categoryCurrent) {
        return false
      }
      this.categoryCurrent = index
      this.page = 1
      this.size = 10
      this.total = 0
      this.totalPage = 0
      this.currentList = []
      this._getDetailCategoryContentById(this.categoryList[this.categoryCurrent].id)
    },

    // 处理金钱，处理总金额和钱
    _handleTotalNumAndTotalPrice() {
      let newlist = this.cartList
      let totalPrice = 0
      let totalNum = 0

      let newlist2 = []
      for (const item of newlist) {
        newlist2.push(item)
      }
      for (const item of newlist2) {
        totalPrice += item.goodsPrice * item.goodsSum
        totalNum += item.goodsSum
      }
      this.totalPrice = totalPrice
      this.totalNum = totalNum
    },

    // 购物车和当前分类内容处理
    _handleNum() {
      const cartList = JSON.parse(JSON.stringify(this.cartList)) // 购物车
      const list = JSON.parse(JSON.stringify(this.currentList)) // 当前分类内容
      // 处理分类内容
      list.forEach(item => {
        let num = 0
        cartList.forEach(cart => {
          if (item.id === cart.goodsId) {
            num = cart.goodsSum
          }
        })
        item.goodsSum = num
      })
      this.currentList = list
    },

    // 获取当前分类商品列表
    _getDetailCategoryContentById(categoryId) {
      wx.request({
        url: `${config.api_base_url}store/goods/${categoryId}?page=${this.page}&size=${this.size}`,
        method: 'GET',
        success: res => {
          if (res.data.status.flag === true) {
            this.categoryList.forEach(item => {
              if (item.id === categoryId) {
                item.content = res.data.data.goodsList
                this.currentList = res.data.data.goodsList
              }
            })
            this.total = res.data.data.total
            this.totalPage = res.data.data.totalPage
          }
        }
      })
    },

    // 获取标签列表
    _getTags() {
      wx.request({
        url: `${config.api_base_url}store/tags/${this.id}`,
        method: 'GET',
        success: res => {
          if (res.data.status.flag === true) {
            this.tags = res.data.data
          }
        }
      })
    },

    // 获取商家信息
    _getStoreInfo() {
      wx.request({
        url: `${config.api_base_url}store/info/${this.id}`,
        method: 'GET',
        success: res => {
          if (res.data.status.flag === true) {
            this.mystore = res.data.data
          }
        }
      })
    },

    // 获取分类列表
    _getCategoryList() {
      wx.request({
        url: `${config.api_base_url}store/category/${this.id}`,
        method: 'GET',
        success: res => {
          if (res.data.status.flag === true) {
            this.categoryList = res.data.data
            this._getDetailCategoryContentById(this.categoryList[this.categoryCurrent].id)
          }
        }
      })
    },

    // 获取商品分类标签
    _getAll() {
      this._getTags()
      this._getCategoryList()
      this._getStoreInfo()
    }
  },
  onReady() {
    const that = this
    wx.getSystemInfo({
      success: ((res) => {
        wx.createSelectorQuery().select(".my-need-height").boundingClientRect(function(data) {
          that.setData({
            plHeight_h5: res.windowHeight - data.height, // 小程序和H5是可以这么设置，但到了自定义头部时不可这样设置
            plHeight_app: res.windowHeight - res.statusBarHeight - 44 - data.height, // app的高度
            maxWindowHeight_h5: res.windowHeight - wx.upx2px(82),
            maxWindowHeight_app: res.windowHeight - res.statusBarHeight - 44 - wx.upx2px(82),
          });
        }).exec()
      })
    })
  },

  onLoad(e) {
    if (!e.id) {
      wx.showToast({
        icon: 'none',
        title: '暂无id, 无法查看详情'
      })
      return false
    }
    this.setData({
      id: e.id
    });

    // 获取你自己的经纬度
    // #ifdef APP-PLUS || MP
    wx.getLocation({
      type: 'wgs84',
      success: ((res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }),
      fail: ((err) => {
        this.setData({
          latitude: undefined,
          longitude: undefined
        });
      }),
      complete: (() => {
        this._getStoreData(); // 商铺详情
      })
    });
    // #endif
    // #ifdef H5
    // h5版本的地理位置
    this._beginSetAddressByH5();
    // #endif
    // 获取评论列表和商铺标签
    this._getCurrentDetailPLData(); // 当前商铺的评论列表
    this._getStoreBQList();
  },

  onPullDownRefresh() {
    if (this.data.selectIndex === 2) {
      this.setData({
        pl_page: 1,
        pl_size: 10,
        pl_total: 0,
        pl_totalPage: 0,
        pl_list: []
      });
      this._getCurrentDetailPLData(); // 评论列表
    } else if (this.data.selectIndex === 1) {
      this.setData({
        mystore: {},
        latitude: '',
        longitude: ''
      });
      // 获取你自己的经纬度
      wx.getLocation({
        type: 'wgs84',
        success: res => {
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: err => {
          this.setData({
            latitude: 38.04276,
            longitude: 114.5143
          });
        },
        complete: (() => {
          this._getStoreData(); // 商铺详情
        })
      });
    } else if (this.data.selectIndex === 0) {
      this.setData({
        categoryList: [],
        categoryCurrent: 0, // 默认是0
        page: 1,
        size: 10,
        total: 0,
        totalPage: 0,
        currentList: [],
        totalPrice: 0,
        totalNum: 0
      });
      this._getCartData(this.data.id); // 获取购物车数据
    }
  },

  // 获取商铺详情
  _getStoreData() {
    // 获取商铺数据的代码
  },

  // 获取评论数据
  _getCurrentDetailPLData() {
    // 获取商铺评论的代码
  },

  // 获取商铺标签
  _getStoreBQList() {
    // 获取商铺标签的代码
  },

  // H5的地址设置
  _beginSetAddressByH5() {
    // H5版本处理地理位置的代码
  },

  // 获取购物车数据
  _getCartData(id) {
    // 获取购物车数据的代码
  }
});
