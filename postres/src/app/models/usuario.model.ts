export interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  pass: string;
  rol: 'admin' | 'cliente';
}
