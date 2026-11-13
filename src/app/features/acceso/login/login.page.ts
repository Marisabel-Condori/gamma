import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gm-login-page',
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  notice = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitLogin(): void {
    this.notice = 'La autenticación de Gamma todavía no está conectada.';
  }
}
