import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CanchaService } from './services/cancha';
import { Cancha } from './models/cancha';
import { ReservaService } from './services/reserva';
import { Reserva } from './models/reserva';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  listaCanchas: Cancha[] = [];
  listaReservas: Reserva[] = []; // <--- 1. Variable para almacenar las reservas de la DB
  filtroNombre: string = '';
  filtroFecha: string = '';

  nuevaCancha: Cancha = {
    nombre: '',
    tipo_deporte: '',
    precio_por_hora: 0,
    esta_activa: true
  };

  nuevaReserva: Reserva = {
    cancha_id: 0,
    nombre_cliente: '',
    fecha_inicio: '',
    fecha_fin: '',
    total_pago: 0,
    estado: 'pendiente'
  };

  constructor(
    private canchaService: CanchaService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.obtenerCanchas();
    this.obtenerReservas(); // <--- 2. Llamamos a la función al iniciar
  }

  obtenerCanchas() {
    this.canchaService.listarCanchas().subscribe({
      next: (data) => { this.listaCanchas = data; },
      error: (e) => console.error(e)
    });
  }

  // <--- 3. Nueva función para traer las reservas de PostgreSQL
  obtenerReservas() {
    this.reservaService.listarReservas().subscribe({
      next: (data) => { this.listaReservas = data; },
      error: (e) => console.error('Error al obtener reservas:', e)
    });
  }

  guardarCancha() {
    this.canchaService.crearCancha(this.nuevaCancha).subscribe({
      next: (res) => {
        alert('¡Cancha guardada con éxito!');
        this.obtenerCanchas();
        this.nuevaCancha = { nombre: '', tipo_deporte: '', precio_por_hora: 0, esta_activa: true };
      },
      error: (e) => alert('Error al guardar. Revisa la consola.')
    });
  }

  borrarCancha(id?: number) {
    if (id && confirm('¿Estás seguro de eliminar esta cancha?')) {
      this.canchaService.eliminarCancha(id).subscribe({
        next: () => {
          alert('Cancha eliminada');
          this.obtenerCanchas();
        },
        error: (e) => alert('No se pudo eliminar')
      });
    }
  }

  calcularTotal() {
    if (this.nuevaReserva.fecha_inicio && this.nuevaReserva.fecha_fin) {
      const inicio = new Date(this.nuevaReserva.fecha_inicio);
      const fin = new Date(this.nuevaReserva.fecha_fin);

      const diferenciaMilisegundos = fin.getTime() - inicio.getTime();
      const horas = diferenciaMilisegundos / (1000 * 60 * 60);

      if (horas > 0) {
        const canchaSeleccionada = this.listaCanchas.find(c => c.id === this.nuevaReserva.cancha_id);
        if (canchaSeleccionada) {
          this.nuevaReserva.total_pago = horas * canchaSeleccionada.precio_por_hora;
        }
      } else {
        this.nuevaReserva.total_pago = 0;
      }
    }
  }

  guardarReserva() {
    this.reservaService.guardarReserva(this.nuevaReserva).subscribe({
      next: (res) => {
        alert('¡Reserva realizada con éxito!');
        this.obtenerReservas(); // <--- 4. Actualizamos la lista automáticamente al guardar
        this.nuevaReserva = {
          cancha_id: 0,
          nombre_cliente: '',
          fecha_inicio: '',
          fecha_fin: '',
          total_pago: 0,
          estado: 'pendiente'
        };
      },
      error: (e) => {
        const mensajeError = e.error?.message || 'Error al reservar. Verifica el horario y disponibilidad.';
        alert(mensajeError);
      }
    });
  }

  borrarReserva(id?: number) {
  if (id && confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    this.reservaService.eliminarReserva(id).subscribe({
      next: () => {
        alert('Reserva cancelada correctamente');
        this.obtenerReservas(); // Refresca la tabla del historial
      },
      error: (e) => {
        console.error(e);
        alert('No se pudo cancelar la reserva.');
      }
    });
  }
}

  // 2. Esta función devolverá la lista filtrada para el HTML
get reservasFiltradas() {
  return this.listaReservas.filter(reserva => {
    const coincideNombre = reserva.nombre_cliente.toLowerCase().includes(this.filtroNombre.toLowerCase());

    // Si no hay fecha seleccionada, pasa el filtro. Si hay, compara solo la parte de la fecha (YYYY-MM-DD)
    const coincideFecha = !this.filtroFecha || reserva.fecha_inicio.includes(this.filtroFecha);

    return coincideNombre && coincideFecha;
  });
}
}
