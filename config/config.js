// config/config.js
const env = __wxConfig.envVersion; // Retrieves the current environment in WeChat Mini Programs

const config = {
  development: {
    baseURL: 'http://localhost:28080'
  },
  trial: {
    baseURL: 'https://test-api.your-site.com'
  },
  release: {
    baseURL: 'https://api.your-site.com'
  }
};

export default config[env] || config.development;