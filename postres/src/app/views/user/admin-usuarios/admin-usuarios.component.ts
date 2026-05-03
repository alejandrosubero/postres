import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService } from '../../../services/security/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { NavService } from '../../../services/navegate/nav.service';


@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
 templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.scss'
})
export class AdminUsuariosComponent implements OnInit {
  private  usuarioService = inject(UsuarioService);
  private navService = inject(NavService);
  public usuarios = this.usuarioService.usuarios();
  editando = signal(false);
  usuarioActual = signal<Usuario>({ nombre: '', email: '', pass: '', rol: 'cliente' });

  ngOnInit() {
    this.usuarioService.obtenerTodos();
  }

  prepararNuevo() {
    this.usuarioActual.set({ nombre: '', email: '', pass: '', rol: 'cliente' });
    this.editando.set(true);
  }

  seleccionarUsuario(u: Usuario) {
    this.usuarioActual.set({ ...u }); // Clon para no editar directamente en la lista
    this.editando.set(true);
  }

  async save() {
    const u = this.usuarioActual();
    if (u.id) {
      await this.usuarioService.editar(u.id, u);
    } else {
      await this.usuarioService.guardar(u);
    }
    this.editando.set(false);
  }

  async delete() {
    const id = this.usuarioActual().id;
    if (id && confirm('¿Eliminar este usuario?')) {
      await this.usuarioService.borrar(id);
      this.editando.set(false);
    }
  }


setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Ingredientes';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.home = true;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/dashboard";

    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }

}