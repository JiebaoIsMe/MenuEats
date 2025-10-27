const BASE_URL = 'http://localhost:8761/api'

const api = {
  async request(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })
    return response.json()
  },

  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, { method: 'POST', body: JSON.stringify(data) })
}

export const chatbot = {
  initialize: () => api.post('/rag/initialize'),
  chat: (query) => api.post('/rag/chat', { query }),
  test: () => api.get('/test')
}

export const restaurants = {
  getAll: () => api.get('/restaurants_with_menu')
}