// utils/request.js
import config from '@/config/config';
import { getToken, removeToken } from '@/utils/auth';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    if (token) {
      options.header = {
        ...options.header,
        Authorization: token
      };
    }

    options.url = `${config.baseURL}${options.url}`;
    options.timeout = options.timeout || 7000;

    wx.request({
      ...options,
      success: (response) => {
        console.log(response)
        const { errorCode, success, message } = response.data;

        if (success) {
          resolve(response.data);
        } else {
          handleError(response);
          reject({ errorCode, message });
        }
      },
      fail: (error) => {
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
  const { data } = response;
  const authErrorCodes = [40001, 40002, 40003, 40004];

  if (authErrorCodes.includes(data.errorCode)) {
    removeToken();
    wx.showToast({
      title: '认证失效，请重新登录',
      icon: 'none'
    });
    setTimeout(() => {
      wx.navigateTo({
        url: 'pages/login/phone/code/index',
      });
    }, 1500);
  } else if (data.message) {
    wx.showToast({
      title: data.message || '请求失败',
      icon: 'error'
    });
  }
}

export default request;