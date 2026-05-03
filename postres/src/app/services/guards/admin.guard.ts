// admin.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.Service'; // Asumiendo que tienes un servicio de Auth

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario actual en tu sistema tiene rol 'admin'
  if (auth.getRolValue() === 'admin') {
    return true;
  }

  router.navigate(['/app/dashboard']);
  return false;
};