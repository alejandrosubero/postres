import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.Service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

   return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);

  // if (authService.isAuthenticated()) {
  //   return true;
  // }
  // return router.createUrlTree(['/login']);
  
};
