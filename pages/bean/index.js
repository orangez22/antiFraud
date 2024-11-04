// pages/beans/beans.js
import request from '../../utils/request';

Page({
	data: {
		md: '10', // 码豆
		list: [] // 消费明细的记录表
	},
	onLoad() {
		const token = wx.getStorageSync('token');
		if (!token) {
			wx.showToast({
				icon: 'none',
				title: '尚未登录, 请先登录'
			});
			setTimeout(() => {
				wx.reLaunch({
					url: 'pages/login/phone/code/index'
				});
			}, 1000);
			return;
		}
		this._getBeansData();
	},
	methods: {
		// 获取码豆数据
		_getBeansData() {
			wx.showLoading({ title: '加载中' });
			request({
				url: '/member/member/myBeans',
			}).then((res) => {
        const {success,data} =res
				if (success) {
					this.setData({
						md: data.beans
					});
				} 
			}).catch(() => {
				this.setData({
					md: 0
				});
				wx.showToast({
					icon: 'none',
					title: '请求失败, 网络异常'
				});
			}).finally(() => {
				wx.hideLoading();
			});
		},
	}
});