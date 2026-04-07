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

  // Objeto para creación y edición
  nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
  editando: boolean = false;

  nuevaReserva = { cancha_id: 0, nombre_cliente: '', fecha_inicio: '', fecha_fin: '', total_pago: 0 };
  filtroNombre: string = '';
  filtroFecha: string = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.usuarioLogueado = JSON.parse(userData);
      this.userRole = this.usuarioLogueado.role;
      this.nombreUsuario = this.usuarioLogueado.name;
      this.nuevaReserva.nombre_cliente = this.usuarioLogueado.name;
      this.obtenerCanchas();
      this.obtenerReservas();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Configuración de encabezados con el Token JWT
  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerCanchas() {
    this.http.get<any[]>('http://localhost:8000/api/canchas', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaCanchas = data,
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
    if (this.editando) {
      // URL LARGA PARA ACTUALIZAR CANCHA
      this.http.put(`http://localhost:8000/api/canchas/${this.nuevaCancha.id}`, this.nuevaCancha, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Cancha actualizada correctamente');
          this.resetFormulario();
          this.obtenerCanchas();
        },
        error: (err) => alert('Error al actualizar: Revisa la consola')
      });
    } else {
      // URL LARGA PARA CREAR CANCHA
      this.http.post('http://localhost:8000/api/canchas', this.nuevaCancha, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Cancha guardada exitosamente');
          this.resetFormulario();
          this.obtenerCanchas();
        },
        error: (err) => alert('Error al guardar: Revisa la consola')
      });
    }
  }

  editarCancha(cancha: any) {
    this.editando = true;
    this.nuevaCancha = { ...cancha };
  }

  // Lógica para crear la reserva con Calendario
  abrirModalReserva(cancha: any) {
    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';

    dateInput.onchange = (e: any) => {
      const fechaSeleccionada = e.target.value;

      if (fechaSeleccionada) {
        const datos = {
          cancha_id: cancha.id,
          nombre_cliente: "Luis Ángel",
          fecha_inicio: fechaSeleccionada.replace('T', ' '),
          fecha_fin: fechaSeleccionada.replace('T', ' '),
          total_pago: cancha.precio_por_hora
        };

        // URL LARGA PARA CREAR RESERVA
        this.http.post('http://localhost:8000/api/reservas', datos, { headers: this.getHeaders() }).subscribe({
          next: () => {
            alert('¡Reserva creada con éxito para Luis Ángel!');
            this.obtenerReservas();
          },
          error: (err) => {
            console.error('Error de API:', err);
            alert('Error al guardar la reserva');
          }
        });
      }
    };
    dateInput.click();
  }

  // FUNCIÓN RECUPERADA: Cancelar/Eliminar Reserva con URL LARGA
  cancelarReserva(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva permanentemente?')) {
      this.http.delete(`http://localhost:8000/api/reservas/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Reserva eliminada con éxito');
          this.obtenerReservas();
        },
        error: (err) => {
          console.error(err);
          alert('Error al intentar eliminar la reserva');
        }
      });
    }
  }

  // Eliminar Reservas (Acción duplicada para el Admin por seguridad)
  eliminarReserva(id: number) {
    this.cancelarReserva(id);
  }

  // Borrar Cancha con URL LARGA
  borrarCancha(id: number) {
    if (confirm('¿Estás seguro de eliminar esta cancha?')) {
      this.http.delete(`http://localhost:8000/api/canchas/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Cancha eliminada');
          this.obtenerCanchas();
        },
        error: (err) => alert('Error al eliminar la cancha')
      });
    }
  }

  resetFormulario() {
    this.nuevaCancha = { id: null, nombre: '', tipo_deporte: '', precio_por_hora: 0 };
    this.editando = false;
  }

  reservasFiltradas() {
    return this.listaReservas.filter(r => {
      const esSuPropiaReserva = this.userRole === 'admin' || r.nombre_cliente === this.usuarioLogueado.name;
      const coincideNombre = r.nombre_cliente.toLowerCase().includes(this.filtroNombre.toLowerCase());
      return esSuPropiaReserva && coincideNombre;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
