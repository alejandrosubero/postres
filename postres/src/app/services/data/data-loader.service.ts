import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingrediente } from '../../models/ingrediente.model';

@Injectable({ providedIn: 'root' })
export class DataLoaderService {
  private http = inject(HttpClient);

  // cargarDataLocal(): Observable<{ ingrediente: Ingrediente[] }> {
  //   return this.http.get<{ ingrediente: Ingrediente[] }>('assets/data.json');
  // }

  cargarDataLocal(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>('assets/data.json');
  }
}

