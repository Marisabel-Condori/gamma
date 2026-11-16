import { Component, inject } from '@angular/core';
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
  showPassword = false;
  loading = false;
  notice = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitLogin(): void {
    if (this.loading) return;
    this.loading = true;
    this.notice = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/inicio';
        void this.router.navigateByUrl(destination);
      },
      error: (error: HttpErrorResponse) => {
        this.notice = error.status === 0
          ? 'No se pudo conectar con Gamma. Verifica que WildFly esté activo.'
          : error.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Intenta de nuevo o revisa el backend.';
        this.loading = false;
      },
    });
  }
}
