import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CanchasComponent } from './components/canchas/canchas'; // Quitamos el .ts del final

export const routes: Routes = [
  // 1. Si la URL está vacía, manda al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Ruta para la pantalla de inicio de sesión
  { path: 'login', component: LoginComponent },

  // 3. Ruta para la gestión de canchas (solo tras el login)
  { path: 'reservas', component: CanchasComponent }
];
