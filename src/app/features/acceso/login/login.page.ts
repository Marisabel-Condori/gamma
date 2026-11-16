import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'gm-login-page',
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  mensajeError = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitLogin(): void {
    this.loading = true;
    this.mensajeError = '';
    if (!this.auth.login(this.username, this.password)) {
      this.mensajeError = 'Usuario o contraseña incorrectos.';
      this.loading = false;
      return;
    }
    void this.router.navigateByUrl('/inicio');
  }
}
