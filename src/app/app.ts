import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CanchaService } from './services/cancha';
import { Cancha } from './models/cancha';
import { ReservaService } from './services/reserva'; // Importación añadida
import { Reserva } from './models/reserva'; // Importación añadida

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  listaCanchas: Cancha[] = [];
  nuevaCancha: Cancha = {
    nombre: '',
    tipo_deporte: '',
    precio_por_hora: 0,
    esta_activa: true
  };

  // Objeto para manejar los datos de la nueva reserva
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
    private reservaService: ReservaService // Inyección del servicio de reservas
  ) {}

  ngOnInit(): void {
    this.obtenerCanchas();
  }

  obtenerCanchas() {
    this.canchaService.listarCanchas().subscribe({
      next: (data) => { this.listaCanchas = data; },
      error: (e) => console.error(e)
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

    // Calcular diferencia en horas
    const diferenciaMilisegundos = fin.getTime() - inicio.getTime();
    const horas = diferenciaMilisegundos / (1000 * 60 * 60);

    if (horas > 0) {
      // Buscamos el precio de la cancha seleccionada
      const canchaSeleccionada = this.listaCanchas.find(c => c.id === this.nuevaReserva.cancha_id);
      if (canchaSeleccionada) {
        this.nuevaReserva.total_pago = horas * canchaSeleccionada.precio_por_hora;
      }
    } else {
      this.nuevaReserva.total_pago = 0;
    }
  }
}

  // Nueva función para enviar la reserva a la base de datos
  guardarReserva() {
  this.reservaService.guardarReserva(this.nuevaReserva).subscribe({
    next: (res) => {
      alert('¡Reserva realizada con éxito!');
      this.nuevaReserva = { cancha_id: 0, nombre_cliente: '', fecha_inicio: '', fecha_fin: '', total_pago: 0, estado: 'pendiente' };
    },
    error: (e) => {
      // Si el backend envía un mensaje de error específico, lo mostramos
      const mensajeError = e.error?.message || 'Error al reservar. Verifica el horario y disponibilidad.';
      alert(mensajeError);
    }
  });
}
}
