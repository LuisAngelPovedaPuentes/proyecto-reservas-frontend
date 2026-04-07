import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './canchas.html',
  styleUrl: './canchas.css'
})
export class CanchasComponent implements OnInit {
  usuarioLogueado: any = null;
  userRole: string = ''; // Almacena 'admin' o 'cliente'

  // Variables para Canchas
  listaCanchas: any[] = [];
  nuevaCancha = { nombre: '', tipo_deporte: '', precio_por_hora: 0 };

  // Variables para Reservas
  listaReservas: any[] = [];
  nuevaReserva = { cancha_id: 0, nombre_cliente: '', fecha_inicio: '', fecha_fin: '', total_pago: 0 };

  // Filtros
  filtroNombre: string = '';
  filtroFecha: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.usuarioLogueado = JSON.parse(userData);
      this.userRole = this.usuarioLogueado.role; // Extraemos el rol
      this.nuevaReserva.nombre_cliente = this.usuarioLogueado.name;
    } else {
      this.router.navigate(['/login']); // Redirigir si no hay sesión
    }

    // Aquí llamarías a tus servicios para cargar datos reales del backend
    this.obtenerCanchas();
    this.obtenerReservas();
  }

  // Lógica para filtrar las reservas en tiempo real
  reservasFiltradas() {
    return this.listaReservas.filter(r => {
      // Si es cliente, solo ve sus propias reservas (basado en su nombre/ID)
      const esSuPropiaReserva = this.userRole === 'admin' || r.nombre_cliente === this.usuarioLogueado.name;

      const coincideNombre = r.nombre_cliente.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideFecha = this.filtroFecha ? r.fecha_inicio.includes(this.filtroFecha) : true;

      return esSuPropiaReserva && coincideNombre && coincideFecha;
    });
  }

  // Métodos funcionales (conecta estos con tu Service de Laravel)
  guardarCancha() {
    console.log('Enviando a Laravel:', this.nuevaCancha);
    // Simulación de guardado exitoso
    this.listaCanchas.push({...this.nuevaCancha, id: Date.now()});
    this.nuevaCancha = { nombre: '', tipo_deporte: '', precio_por_hora: 0 };
    alert('Cancha guardada correctamente');
  }

  obtenerCanchas() {
    // Aquí iría: this.canchaService.listar().subscribe(...)
    this.listaCanchas = []; // Se llena con datos de la DB
  }

  obtenerReservas() {
    // Aquí iría: this.reservaService.listar().subscribe(...)
    this.listaReservas = [];
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('user'); // Limpiar rastro
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
