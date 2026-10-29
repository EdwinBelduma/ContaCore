import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

/*
 * Enviar automáticamente el token
 * en cada petición al backend.
 */
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(
                'accessToken',
            )

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

/*
 * Si Spring Boot responde 401,
 * significa que la sesión/token
 * ya no es válido.
 *
 * ContaCore:
 * 1. Borra el token.
 * 2. Envía automáticamente al login.
 */
api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (
            error.response?.status === 401
        ) {
            localStorage.removeItem(
                'accessToken',
            )

            if (
                window.location.pathname !==
                '/login'
            ) {
                window.location.href =
                    '/login'
            }
        }

        return Promise.reject(error)
    },
)

export default api