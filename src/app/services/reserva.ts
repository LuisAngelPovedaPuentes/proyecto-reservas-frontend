import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // Esta URL debe coincidir con la ruta definida en tu Laravel
  private apiUrl = 'http://localhost:8000/api/reservas';

  constructor(private http: HttpClient) { }

  // Obtener todas las reservas registradas
  obtenerReservas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Guardar una nueva reserva
  guardarReserva(reserva: any): Observable<any> {
    return this.http.post(this.apiUrl, reserva);
  }
}
