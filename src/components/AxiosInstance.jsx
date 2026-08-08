// src/components/AxiosInstance.js
import axios from 'axios'

// Configuration pour Vite.js (comme dans app1)
const getBaseUrl = () => {
  // Priorité 1 : Variable d'environnement explicite
  const envApiUrl = import.meta.env.VITE_API_URL
  
  if (envApiUrl) {
    return envApiUrl
  }
  
  // Priorité 2 : Détection selon le mode
  if (import.meta.env.PROD) {
    //  Remplacez par l'URL de production de votre app
    return 'https://seydi-group-back.onrender.com'  // À personnaliser
  }
  
  // Développement local (votre URL actuelle)
  return 'http://127.0.0.1:8000'
}

const baseUrl = getBaseUrl()

console.log(`🚀 Environnement: ${import.meta.env.MODE}`)
console.log(`🔗 URL API (app2): ${baseUrl}`)
console.log(`📦 Production: ${import.meta.env.PROD}`)

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
    }
})

// Intercepteurs (identiques à votre app2)
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('Token')
        console.log('📤 Making request to:', config.url, 'with token:', !!token)
        
        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        return config
    },
    (error) => {
        console.error('❌ Request interceptor error:', error)
        return Promise.reject(error)
    }
)

AxiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status, response.config.url)
        return response
    }, 
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.config?.url)
        
        if(error.response && error.response.status === 401){
            console.log('🔒 Unauthorized, removing token')
            localStorage.removeItem('Token')
            localStorage.removeItem('User')
            localStorage.removeItem('UserAgences')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default AxiosInstance