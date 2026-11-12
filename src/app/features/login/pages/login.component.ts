import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthState } from '../../../core/state/auth-state';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthState);
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
    this.loading = true;
    if (!this.auth.login(this.username, this.password)) {
      this.notice = 'Usuario o contraseña incorrectos.';
      this.loading = false;
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/inicio';
    void this.router.navigateByUrl(destination);
  }
}
