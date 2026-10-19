import api from './api'

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
}

export async function login(
    credentials: LoginRequest,
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        '/auth/login',
        credentials,
    )

    return response.data
}