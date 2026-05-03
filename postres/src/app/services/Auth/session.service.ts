// src/app/services/session.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.Service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // Signal para el estado del usuario
  user = signal<any | null>(null);
  isLoggedIn = signal<boolean>(false);
   private authService= inject(AuthService);

  login(userData: any) {
    this.user.set(userData);
    this.isLoggedIn.set(true);
    localStorage.setItem('session', JSON.stringify(userData));
    this.authService.loginU(userData.rol);
  }

  logout() {
    this.user.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('session');
  }
}