// utils/auth.js
const TOKEN_KEY = 'Authorization';

// 获取 Token
export function getToken() {
    return wx.getStorageSync(TOKEN_KEY) || null
}

// 设置 Token
export function setToken(token) {
    return wx.setStorageSync(TOKEN_KEY, 'Bearer '+token)
}

// 删除 Token
export function removeToken() {
    return wx.removeStorageSync(TOKEN_KEY)
}

export function setId(id){
  return wx.setStorageSync('id', id)
}

export function getId(){
  return wx.getStorageSync('id')
}

export function removeId(){
  wx.removeStorageSync('id')
}