import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
  private readonly route = inject(ActivatedRoute);
  username = '';
  password = '';
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly mensajeError = signal('');

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  submitLogin(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.mensajeError.set('');
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/inicio';
        void this.router.navigateByUrl(destination);
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(
          error.status === 0
            ? 'No se pudo conectar con Gamma. Revisa que el backend esté activo.'
            : error.status === 401
              ? error.error?.mensaje || 'Usuario o contraseña incorrectos.'
              : error.message || 'No se pudo iniciar sesión. Intenta de nuevo o revisa el backend.',
        );
        this.loading.set(false);
      },
    });
  }
}
