import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambia esta URL si tu Laravel corre en otro puerto
  private API_URL = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // Función para registrarse
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  // Función para iniciar sesión
  login(credentials: any): Observable<any> {
  return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
    tap(res => {
      // Guardamos el token para las peticiones
      localStorage.setItem('token', res.access_token);
      // Guardamos los datos del usuario (incluyendo el rol)
      localStorage.setItem('user', JSON.stringify(res.user));
    })
  );
}

  // Función para saber si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Función para cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
