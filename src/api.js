import axios from 'axios'

const api = axios.create({
  baseURL: '/api/',
})

api.interceptors.request.use((config) => {
  const url = (config?.url || '').toString()
  const isAuthEndpoint = url.startsWith('auth/login') || url.startsWith('auth/register') || url.startsWith('auth/refresh') || url.startsWith('auth/password')
  const tokens = JSON.parse(localStorage.getItem('tokens') || 'null')
  if (!isAuthEndpoint && tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {}
    const url = (originalRequest.url || '').toString()
    const isAuthEndpoint = url.startsWith('auth/login') || url.startsWith('auth/register') || url.startsWith('auth/refresh') || url.startsWith('auth/password')
    // Only try refresh for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || 'null')
        if (!tokens?.refresh) throw new Error('No refresh token')
        const resp = await axios.post('/api/auth/refresh/', { refresh: tokens.refresh })
        const newTokens = { ...tokens, access: resp.data.access }
        localStorage.setItem('tokens', JSON.stringify(newTokens))
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
        return api(originalRequest)
      } catch (e) {
        // Clear stale tokens and forward the original error
        localStorage.removeItem('tokens')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
