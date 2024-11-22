// utils/auth.js
const TOKEN_KEY = 'Authorization';
const USER_INFO = 'userInfo';
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
// 获取 用户信息
export function getUser() {
  return wx.getStorageSync(USER_INFO) || null
}

// 设置 用户信息
export function setUser(user) {
  return wx.setStorageSync(USER_INFO, user)
}