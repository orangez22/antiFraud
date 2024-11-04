// utils/request.js
import config from '@/config/config';
import { getToken } from '@/utils/auth';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    console.log("token:"+token)
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`
      };
    }

    options.url = `${config.baseURL}${options.url}`;
    options.timeout = options.timeout || 7000;

    wx.request({
      ...options,
      success: (response) => {
        const statusCode = response.statusCode;
        const data = response.data;

        if (statusCode >= 200 && statusCode < 300) {
          resolve(data);
        } else {
          handleError(response);
          reject(data);
        }
      },
      fail: (error) => {
        console.log(error)
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
        reject(error);
      }
    });
  });
};

function handleError(response) {
  const { statusCode, data } = response;
  if (statusCode === 401 || statusCode === 402) {
    store.dispatch('logout').then(() => {
      wx.showToast({
        title: '认证失效，请重新登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/login/login' });
      }, 1500);
    });
  } else if (!data.success) {
    const message = data.message || '请求失败';
    wx.showToast(message, 'error');
  }
}

export default request;