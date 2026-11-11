import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
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
