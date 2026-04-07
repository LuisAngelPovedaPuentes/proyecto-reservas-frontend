export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'cliente'; // Solo permitimos estos dos valores
    created_at?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}
