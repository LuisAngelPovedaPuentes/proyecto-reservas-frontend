export interface Reserva {
  id?: number;
  cancha_id: number;
  nombre_cliente: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_pago: number;
  estado: string;
}
