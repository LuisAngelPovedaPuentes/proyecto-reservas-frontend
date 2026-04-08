import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './canchas.html',
  styleUrl: './canchas.css'
})
export class CanchasComponent implements OnInit {
  usuarioLogueado: any = null;
  userRole: string = '';
  nombreUsuario: string = '';

  listaCanchas: any[] = [];
  listaReservas: any[] = [];

  nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
  editando: boolean = false;

  // VARIABLES PARA EL MODAL
  canchaSeleccionada: any = null;
  nuevaReservaForm = { fecha_inicio: '', fecha_fin: '' };

  filtroNombre: string = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.usuarioLogueado = JSON.parse(userData);
      this.userRole = this.usuarioLogueado.role;
      this.nombreUsuario = this.usuarioLogueado.name;
      this.obtenerCanchas();
      this.obtenerReservas();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerCanchas() {
    this.http.get<any[]>('http://localhost:8000/api/canchas', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaCanchas = data.sort((a, b) => a.precio_por_hora - b.precio_por_hora),
      error: (err) => console.error('Error al cargar canchas', err)
    });
  }

  obtenerReservas() {
    this.http.get<any[]>('http://localhost:8000/api/reservas', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaReservas = data,
      error: (err) => console.error('Error al cargar reservas', err)
    });
  }

  guardarCancha() {
    const request = this.editando
      ? this.http.put(`http://localhost:8000/api/canchas/${this.nuevaCancha.id}`, this.nuevaCancha, { headers: this.getHeaders() })
      : this.http.post('http://localhost:8000/api/canchas', this.nuevaCancha, { headers: this.getHeaders() });

    request.subscribe({
      next: () => {
        alert(this.editando ? 'Cancha actualizada' : 'Cancha guardada');
        this.resetFormulario();
        this.obtenerCanchas();
      },
      error: () => alert('Error en la operación')
    });
  }

  editarCancha(cancha: any) {
    this.editando = true;
    this.nuevaCancha = { ...cancha };
  }

  borrarCancha(id: number) {
    if (confirm('¿Eliminar esta cancha?')) {
      this.http.delete(`http://localhost:8000/api/canchas/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.obtenerCanchas(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  resetFormulario() {
    this.nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
    this.editando = false;
  }

  // --- LÓGICA DE RESERVAS SINCRONIZADA ---
  prepararReserva(cancha: any) {
    console.log('Preparando reserva para:', cancha.nombre);
    this.canchaSeleccionada = cancha;
    this.nuevaReservaForm = { fecha_inicio: '', fecha_fin: '' };
  }

  confirmarReserva() {
    if (!this.nuevaReservaForm.fecha_inicio || !this.nuevaReservaForm.fecha_fin) {
      alert('Debe completar ambas fechas');
      return;
    }

    const datos = {
      cancha_id: this.canchaSeleccionada.id,
      user_id: this.usuarioLogueado.id,
      fecha_inicio: this.nuevaReservaForm.fecha_inicio.replace('T', ' ') + ':00',
      fecha_fin: this.nuevaReservaForm.fecha_fin.replace('T', ' ') + ':00'
    };

    this.http.post('http://localhost:8000/api/reservas', datos, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert('Reserva exitosa');
        this.obtenerReservas();
      },
      error: (err) => alert('Error: ' + (err.error.message || 'Cancha ocupada'))
    });
  }

  cancelarReserva(id: number) {
    if (confirm('¿Eliminar reserva?')) {
      this.http.delete(`http://localhost:8000/api/reservas/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.obtenerReservas(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  reservasFiltradas() {
    return this.listaReservas.filter(r =>
      r.nombre_cliente.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
