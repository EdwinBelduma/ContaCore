import api from './api'

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
}

export interface CurrentUserResponse {
    email: string
    roles: string[]
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

export async function getCurrentUser(): Promise<CurrentUserResponse> {
    const response =
        await api.get<CurrentUserResponse>(
            '/auth/me',
        )

    return response.data
}