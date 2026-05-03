import { Routes } from '@angular/router';
import { authGuard } from './services/guards/auth.guard';
import { adminGuard } from './services/guards/admin.guard';

export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./views/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'app',
    loadComponent: () => import('../app/core/layout/layout.component').then(c => c.LayoutComponent),
    data: { animation: 'pro' },
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { animation: 'HomePage' }, canActivate: [authGuard] },
      {
        path: 'ingredient',
        canActivate: [authGuard],
        children: [
          { path: 'add', loadComponent: () => import('./views/ingredientes/add-ingrediente/add-ingrediente.component').then(c => c.AddIngredienteComponent), data: { animation: 'ingredient' } },
          { path: 'list', loadComponent: () => import('./views/ingredientes/list-ingrediente/list-ingrediente.component').then(c => c.ListIngredienteComponent), data: { animation: 'ingredient' } },
          { path: 'detail', loadComponent: () => import('./views/ingredientes/detail-ingrediente/detail-ingrediente.component').then(c => c.DetailIngredienteComponent), data: { animation: 'ingredient' } },
          { path: 'edit', loadComponent: () => import('./views/ingredientes/edit-ingrediente/edit-ingrediente.component').then(c => c.EditIngredienteComponent), data: { animation: 'ingredient' } },
        ]
      },
      {
        path: 'receta',
        canActivate: [authGuard],
        children: [
          { path: 'add', loadComponent: () => import('./views/receta/add-receta/add-receta.component').then(c => c.AddRecetaComponent), data: { animation: 'ingredient' } },
          { path: 'list', loadComponent: () => import('./views/receta/lista-receta/lista-receta.component').then(c => c.ListaRecetaComponent), data: { animation: 'ingredient' } },
          { path: 'detail', loadComponent: () => import('./views/receta/detail-receta/detail-receta.component').then(c => c.DetailRecetaComponent), data: { animation: 'ingredient' } },
          { path: 'edit', loadComponent: () => import('./views/receta/edit-receta/edit-receta.component').then(c => c.EditRecetaComponent), data: { animation: 'ingredient' } },
        ]
      },
      {
        path: 'pedido',
        canActivate: [authGuard],
        children: [
          { path: 'add', loadComponent: () => import('./views/Pedido/add/add-pedido/add-pedido.component').then(c => c.AddPedidoComponent), data: { animation: 'pedido' } },
          { path: 'list', loadComponent: () => import('./views/Pedido/list/pedido-lista/pedido-lista.component').then(c => c.PedidoListaComponent), data: { animation: 'pedido' } },
          { path: 'detail', loadComponent: () => import('./views/Pedido/detail/pedido-detail/pedido-detail.component').then(c => c.PedidoDetailComponent), data: { animation: 'pedido' } },
          { path: 'edit', loadComponent: () => import('./views/Pedido/edit/edit-pedido/edit-pedido.component').then(c => c.EditPedidoComponent), data: { animation: 'pedido' } },
        ]
      },

      {
        path: 'mager',
        canActivate: [authGuard],
        children: [
          { path: 'calendar', loadComponent: () => import('./views/calendario/components/calendar-shell/calendar-shell.component').then(m => m.CalendarShellComponent), data: { animation: 'calendar' }, canActivate: [authGuard] },
          { path: 'usuarios', loadComponent: () => import('./views/user/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent), data: { animation: 'calendar' }, canActivate: [adminGuard] },
          { path: 'inventario', loadComponent: () => import('./views/inventario/inventory/inventory.component').then(m => m.InventoryComponent), data: { animation: 'calendar' }, canActivate: [authGuard] },
        ]
      },

    ]
  },
  { path: '**', redirectTo: '/login' }
];


