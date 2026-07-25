import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use((config) => {
      const { token } = useAuthStore.getState()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
        }
        return Promise.reject(error)
      }
    )
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  async register(email: string, password: string, name: string) {
    return this.client.post('/auth/register', { email, password, name })
  }

  async getCurrentUser() {
    return this.client.get('/auth/me')
  }

  async getDocuments() {
    return this.client.get('/documents')
  }

  async uploadDocument(name: string, content: string, type: string) {
    return this.client.post('/documents/upload', { name, content, type })
  }

  async getDocument(id: string) {
    return this.client.get(`/documents/${id}`)
  }

  async deleteDocument(id: string) {
    return this.client.delete(`/documents/${id}`)
  }

  async summarizeDocument(documentId: string, content: string) {
    return this.client.post('/ai/summarize', { documentId, content })
  }

  async extractKeyPoints(content: string) {
    return this.client.post('/ai/extract-points', { content })
  }

  async chatWithDocument(documentId: string, message: string, context: string) {
    return this.client.post('/ai/chat', { documentId, message, context })
  }

  async extractData(content: string, extractionType: string) {
    return this.client.post('/extraction/extract', { content, extractionType })
  }
}

export const apiClient = new ApiClient()
