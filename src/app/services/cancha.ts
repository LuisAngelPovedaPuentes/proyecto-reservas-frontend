import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/cancha';

@Injectable({
  providedIn: 'root'
})
export class CanchaService {
  private apiUrl = 'http://localhost:8000/api/canchas';

  constructor(private http: HttpClient) { }

  listarCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.apiUrl);
  }

  // AGREGA ESTA FUNCIÓN NUEVA:
  crearCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.apiUrl, cancha);
  }
  // Agrega esto al final de tu clase CanchaService
eliminarCancha(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}
