// utils/request.js
import config from '@/config/config';
import {
  getToken,
  removeToken
} from '@/utils/auth';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    console.log("token:" + token)
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `${token}`
      };
    }

    options.url = `${config.baseURL}${options.url}`;
    options.timeout = options.timeout || 7000;

    wx.request({
      ...options,
      success: (response) => {
        const errorCode = response.statusCode;
        const data = response.data;

        if (errorCode === 20000) {
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
  const {
    data
  } = response;
  const authErrorCodes = [40001, 40002, 40003, 40004];

  if (authErrorCodes.includes(data.errorCode)) {
    removeToken()
    wx.showToast({
      title: '认证失效，请重新登录',
      icon: 'none'
    });
    setTimeout(() => {
      wx.navigateTo({
        url: 'pages/login/phone/code/index',
      })
    }, 1500);

  } else if (!data.success) {
    const message = data.message || '请求失败';
    wx.showToast({
      title: message,
      icon: 'error'
    });
  }
}

export default request;