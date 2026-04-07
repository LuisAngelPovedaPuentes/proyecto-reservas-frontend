import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializamos el formulario con validaciones profesionales
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Consumimos el servicio que ya tiene corregido el API_URL
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log('¡Conexión exitosa con Laravel!', res);
          // Redirigimos a la ruta de reservas configurada
          this.router.navigate(['/reservas']);
        },
        error: (err) => {
          this.isLoading = false;
          // Capturamos el error de Laravel (401 Unauthorized)
          this.errorMessage = err.error.message || 'Credenciales incorrectas. Intenta de nuevo.';
          console.error('Error de autenticación:', err);
        }
      });
    }
  }
}
