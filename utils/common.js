// utils/common.js
import request from '@/utils/request';
import { setId } from './auth';
// 表单校验方法
export function validateForm(data, rules) {
  return new Promise((resolve, reject) => {
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = data[field];

      for (const rule of fieldRules) {
        // 校验 required 属性
        if (rule.required && (value === undefined || value === null || value === '')) {
          return reject(rule.message);
        }
        // 校验 pattern 正则表达式
        if (rule.pattern && !rule.pattern.test(value)) {
          return reject(rule.message);
        }
        // 校验自定义校验函数
        if (rule.validator && typeof rule.validator === 'function') {
          const isValid = rule.validator(value);
          if (!isValid) {
            return reject(rule.message);
          }
        }
      }
    }
    resolve(); // 所有校验都通过
  });
}

//验证登录方法
export function isLogin() {
  let token = wx.getStorageSync('Authorization')
  if (!token) {
    wx.showToast({
      icon: 'none',
      title: '尚未登录, 请先登录'
    })
    setTimeout(() => {
      wx.clearStorageSync()
      wx.reLaunch({
        url: '/pages/login/phone/code/index'
      })
    }, 1000)
    return
  }
  return true
}

export function getIdByToken(){
  let token=wx.getStorageSync('Authorization')
  if(!token){
    wx.showToast({
      title: 'token丢失',
      icon:'error'
    })
    setTimeout(() => {
      wx.clearStorageSync()
      wx.reLaunch({
        url: '/pages/login/phone/code/index'
      })
    }, 1000)
  }

  request({
    url: '/sso/member/getMemberIdByToken'
  }).then(res=>{
    setId(res.data)
    return res.data
  }).catch(err=>{
    console.log(err)
  })
}