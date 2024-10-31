// utils/auth.js
const TOKEN_KEY = 'Authorization';

// 获取 Token
export function getToken() {
    return wx.getStorageSync(TOKEN_KEY) || null;
}

// 设置 Token
export function setToken(token) {
    return wx.setStorageSync(TOKEN_KEY, token);
}

// 删除 Token
export function removeToken() {
    return wx.removeStorageSync(TOKEN_KEY);
}