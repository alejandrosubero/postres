
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private loggedIn = signal<boolean>(false);
  private rol = signal<string>("");

  login() {
    this.loggedIn.set(true);
  }

  loginU(rol: string) {
    this.loggedIn.set(true);
    this.rol.set(rol);
  }

  logout() {
    this.loggedIn.set(false);
    this.rol.set("")
  }

  isAuthenticated(): boolean {
    return this.loggedIn();
  }

  public getRolValue(): string {
    return this.rol();
  }

}




