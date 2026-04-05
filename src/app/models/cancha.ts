export interface Cancha {
  id?: number;
  nombre: string;
  tipo_deporte: string; // Antes era 'tipo'
  precio_por_hora: number;
  imagen?: string;
  esta_activa: boolean; // Antes era 'disponible'
}
export interface Reserva {
  id?: number;
  cancha_id: number;
  nombre_cliente: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_pago: number;
  estado: string;
}
