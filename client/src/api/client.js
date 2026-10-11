import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('fintech_token');
    }
    return Promise.reject(err);
  }
);

/* --------------------------------- public -------------------------------- */
export const fetchPosts = (params) => api.get('/posts', { params }).then((r) => r.data);
export const fetchFeatured = (limit = 5) =>
  api.get('/posts/featured', { params: { limit } }).then((r) => r.data);
export const fetchPost = (slug) => api.get(`/posts/${slug}`).then((r) => r.data);
export const fetchCalendar = (year, month) =>
  api.get('/posts/archive/calendar', { params: { year, month } }).then((r) => r.data);
export const fetchArchiveMonths = () => api.get('/posts/archive/months').then((r) => r.data);
export const fetchCategories = (params) => api.get('/categories', { params }).then((r) => r.data);
export const fetchCategory = (slug) => api.get(`/categories/${slug}`).then((r) => r.data);
export const fetchPages = () => api.get('/pages').then((r) => r.data);
export const fetchPage = (slug) => api.get(`/pages/${slug}`).then((r) => r.data);
export const fetchComments = (slug) => api.get(`/comments/post/${slug}`).then((r) => r.data);
export const postComment = (payload) => api.post('/comments', payload).then((r) => r.data);
export const postSubmission = (payload) => api.post('/submissions', payload).then((r) => r.data);
export const resolveLegacy = (params) => api.get('/resolve', { params }).then((r) => r.data);

/* ---------------------------------- auth --------------------------------- */
export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);
export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

/* --------------------------------- admin --------------------------------- */
export const adminPosts = (params) => api.get('/posts/admin/all', { params }).then((r) => r.data);
export const adminGetPost = (id) => api.get(`/posts/admin/one/${id}`).then((r) => r.data);
export const createPost = (payload) => api.post('/posts', payload).then((r) => r.data);
export const updatePost = (id, payload) => api.put(`/posts/${id}`, payload).then((r) => r.data);
export const deletePost = (id) => api.delete(`/posts/${id}`).then((r) => r.data);

export const createCategory = (payload) => api.post('/categories', payload).then((r) => r.data);
export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

export const createPage = (payload) => api.post('/pages', payload).then((r) => r.data);
export const updatePage = (id, payload) => api.put(`/pages/${id}`, payload).then((r) => r.data);
export const deletePage = (id) => api.delete(`/pages/${id}`).then((r) => r.data);

export const adminComments = () => api.get('/comments').then((r) => r.data);
export const approveComment = (id) => api.put(`/comments/${id}/approve`).then((r) => r.data);
export const deleteComment = (id) => api.delete(`/comments/${id}`).then((r) => r.data);

export const adminSubmissions = () => api.get('/submissions').then((r) => r.data);
export const updateSubmission = (id, payload) =>
  api.put(`/submissions/${id}`, payload).then((r) => r.data);
export const deleteSubmission = (id) => api.delete(`/submissions/${id}`).then((r) => r.data);

export default api;
