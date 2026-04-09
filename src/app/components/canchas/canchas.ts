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

  // Para búsqueda de usuarios (Admin)
  listaUsuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busquedaUsuario: string = '';
  usuarioSeleccionado: any = null;

  nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
  editando: boolean = false;

  canchaSeleccionada: any = null;
  nuevaReservaForm = { fecha_inicio: '', fecha_fin: '' };

  editandoReserva: boolean = false;
  reservaIdAEditar: number | null = null;

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
      if (this.userRole === 'admin') this.obtenerUsuarios();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerUsuarios() {
    this.http.get<any[]>('http://localhost:8000/api/usuarios-lista', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaUsuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  filtrarUsuarios() {
    if (this.busquedaUsuario.length > 1) {
      this.usuariosFiltrados = this.listaUsuarios.filter(u =>
        u.name.toLowerCase().includes(this.busquedaUsuario.toLowerCase())
      );
    } else {
      this.usuariosFiltrados = [];
    }
  }

  seleccionarUsuario(u: any) {
    this.usuarioSeleccionado = u;
    this.busquedaUsuario = u.name;
    this.usuariosFiltrados = [];
  }

  obtenerCanchas() {
    this.http.get<any[]>('http://localhost:8000/api/canchas', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaCanchas = data.sort((a, b) => a.precio_por_hora - b.precio_por_hora),
      error: (err) => console.error('Error al cargar canchas', err)
    });
  }

  // Agrega esto dentro de la clase en canchas.ts si falta:
editarCancha(cancha: any) {
  console.log('Editando:', cancha);
  // Tu lógica de edición aquí
}

eliminarCancha(id: number) {
  if(confirm('¿Estás seguro de eliminar esta cancha?')) {
    // Tu lógica de eliminación aquí
  }
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

  resetFormulario() {
    this.nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
    this.editando = false;
  }

  prepararReserva(cancha: any) {
    this.canchaSeleccionada = cancha;
    this.nuevaReservaForm = { fecha_inicio: '', fecha_fin: '' };
    this.busquedaUsuario = '';
    this.usuarioSeleccionado = null;
    this.editandoReserva = false;
  }

  prepararEdicionReserva(reserva: any) {
    this.editandoReserva = true;
    this.reservaIdAEditar = reserva.id;
    this.canchaSeleccionada = reserva.cancha;
    this.nuevaReservaForm = {
      fecha_inicio: reserva.fecha_inicio.substring(0, 16),
      fecha_fin: reserva.fecha_fin.substring(0, 16)
    };
  }

  confirmarReserva() {
    const inicio = this.nuevaReservaForm.fecha_inicio.replace('T', ' ') + ':00';
    const fin = this.nuevaReservaForm.fecha_fin.replace('T', ' ') + ':00';

    const datos: any = {
      cancha_id: this.canchaSeleccionada.id,
      fecha_inicio: inicio,
      fecha_fin: fin
    };

    // Lógica de usuario para Admin vs Cliente
    if (this.userRole === 'admin') {
      datos.user_id = this.usuarioSeleccionado ? this.usuarioSeleccionado.id : null;
      datos.nombre_manual = this.busquedaUsuario;
    } else {
      datos.user_id = this.usuarioLogueado.id;
    }

    if (this.editandoReserva && this.reservaIdAEditar) {
      this.http.put(`http://localhost:8000/api/reservas/${this.reservaIdAEditar}`, datos, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Reserva actualizada');
          this.obtenerReservas();
          this.editandoReserva = false;
        },
        error: (err) => alert('Error: ' + (err.error.message || 'Error'))
      });
    } else {
      this.http.post('http://localhost:8000/api/reservas', datos, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Reserva creada con éxito');
          this.obtenerReservas();
        },
        error: (err) => alert('Error: ' + (err.error.message || 'Cancha ocupada'))
      });
    }
  }

  cancelarReserva(id: number) {
    if (confirm('¿Eliminar permanentemente?')) {
      this.http.delete(`http://localhost:8000/api/reservas/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.obtenerReservas(),
        error: () => alert('Error')
      });
    }
  }

  cambiarEstadoReserva(id: number, nuevoEstado: string) {
    if (confirm(`¿Marcar como ${nuevoEstado}?`)) {
      this.http.put(`http://localhost:8000/api/reservas/${id}`, { estado: nuevoEstado }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert(`Reserva ${nuevoEstado}`);
          this.obtenerReservas();
        },
        error: () => alert('Error')
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
