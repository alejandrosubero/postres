

// src/app/views/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/security/usuario.service';
import { SessionService } from '../../services/Auth/session.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';


@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public email = '';
  public password = '';
  public errorMessage = signal<string>('');

  private userService = inject(UsuarioService);
  private sessionService = inject(SessionService);
  private router = inject(Router);


  async onLogin() {
    this.errorMessage.set('');

    try {
      const listaUsuarios = await this.userService.usuarios();
      const userData = listaUsuarios.find(u => u.nombre === this.email);

      if (!userData) {
        this.errorMessage.set('Usuario no encontrado.');
        return;
      }

      if (userData.pass === this.password) {
        this.sessionService.login(userData);
        this.router.navigate(['/app/dashboard']);
      } else {
        this.errorMessage.set('Contraseña incorrecta.');
      }
    } catch (error) {
      console.error("Error en login:", error);
      this.errorMessage.set('Error de conexión o datos corruptos, intenta más tarde.');
    }
  }
}
