import api from './api'

export const adminApi = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  setUserStatus: (userId, isActive) =>
    api.patch(`/admin/users/${userId}/status`, { isActive }).then((r) => r.data),

  getOrders: (status) =>
    api.get('/admin/orders', { params: status && status !== 'all' ? { status } : {} }).then((r) => r.data),
  setOrderStatus: (orderId, status) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }).then((r) => r.data),

  getMeals: () => api.get('/admin/menu').then((r) => r.data),
  createMeal: (payload) => api.post('/admin/menu', payload).then((r) => r.data),
  updateMeal: (mealId, payload) => api.patch(`/admin/menu/${mealId}`, payload).then((r) => r.data),
  deleteMeal: (mealId) => api.delete(`/admin/menu/${mealId}`).then((r) => r.data),
}
