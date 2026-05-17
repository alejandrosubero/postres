
import {Component,OnInit,inject,signal,computed,ChangeDetectionStrategy} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GastoOperativoService } from '../../../services/data/gasto-operativo.service';
import { GastoOperativo } from '../../../models/gasto-operativo';
import { NavService } from '../../../services/navegate/nav.service';
import { NavConfig } from '../../../models/navegation/navElemet.model';
 
type Vista = 'lista' | 'detalle' | 'formulario';

@Component({
selector: 'app-gastos-operativos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './gastos-operativos.component.html',
  styleUrl: './gastos-operativos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GastosOperativosComponent implements OnInit {
 
  private fb = inject(FormBuilder);
  private gastoService = inject(GastoOperativoService);
  private navService = inject(NavService);
 
  // ─── Estado de la UI ───────────────────────────────────────────────────────
  vistaActual = signal<Vista>('lista');
  gastoSeleccionado = signal<GastoOperativo | null>(null);
  modoEdicion = signal(false);
  cargando = signal(false);
  mostrarConfirmEliminar = signal(false);
  terminoBusqueda = signal('');
  anioFiltro = signal('');
  mensaje = signal<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
 
  // ─── Datos del servicio (Signals) ──────────────────────────────────────────
  gastosOperativos = this.gastoService.gastosOperativos;
  totalGastos = this.gastoService.totalGastos;
 
  // ─── Computed: lista filtrada ──────────────────────────────────────────────
  gastosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase().trim();
    const anio = this.anioFiltro().trim();
    const gastos = this.gastosOperativos();
 
    return gastos.filter(g => {
      const cumpleBusqueda = termino.length < 2
        ? true
        : this.filtrarPorTermino(g, termino);
      const cumpleAnio = anio ? g.year.toString() === anio : true;
      return cumpleBusqueda && cumpleAnio;
    });
  });
 
  // ─── Computed: suma total filtrada ────────────────────────────────────────
  sumaFiltrada = computed(() =>
    this.gastosFiltrados().reduce((acc, g) => acc + g.cantidad, 0)
  );
 
  // ─── Formulario reactivo ──────────────────────────────────────────────────
  form!: FormGroup;
 
  // ─── Años disponibles para el select ─────────────────────────────────────
  aniosDisponibles = computed(() => {
    const anios = new Set(this.gastosOperativos().map(g => g.year));
    return Array.from(anios).sort((a, b) => b - a);
  });
 
constructor(){
  this.setNav();
}


  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarGastos();
  }
 
  private inicializarFormulario(gasto?: GastoOperativo): void {
    const hoy = new Date();
    this.form = this.fb.group({
      cantidad: [gasto?.cantidad ?? null, [Validators.required, Validators.min(0.01)]],
      descripcion: [gasto?.descripcion ?? '', [Validators.required, Validators.minLength(3)]],
      fecha: [
        gasto ? this.formatearFechaInput(gasto.fecha) : this.formatearFechaInput(hoy),
        Validators.required
      ],
      year: [gasto?.year ?? hoy.getFullYear(), [Validators.required, Validators.min(2000)]]
    });
  }
 
  private formatearFechaInput(fecha: Date | string): string {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return d.toISOString().split('T')[0];
  }
 
  private filtrarPorTermino(g: GastoOperativo, termino: string): boolean {
    // Búsqueda por año
    if (g.year.toString().includes(termino)) return true;
    // Búsqueda por cantidad
    if (g.cantidad.toString().includes(termino)) return true;
    // Búsqueda por descripción (desde el 2do dígito/carácter)
    if (termino.length >= 2 && g.descripcion.toLowerCase().includes(termino)) return true;
    // Búsqueda por fecha
    const fechaStr = this.formatearFechaInput(g.fecha);
    if (fechaStr.includes(termino)) return true;
    return false;
  }
 
  // ─── Navegación ───────────────────────────────────────────────────────────
  irALista(): void {
    this.vistaActual.set('lista');
    this.gastoSeleccionado.set(null);
    this.modoEdicion.set(false);
    this.mostrarConfirmEliminar.set(false);
    this.limpiarMensaje();
  }
 
  verDetalle(gasto: GastoOperativo): void {
    this.gastoSeleccionado.set(gasto);
    this.vistaActual.set('detalle');
    this.limpiarMensaje();
  }
 
  abrirFormularioNuevo(): void {
    this.modoEdicion.set(false);
    this.gastoSeleccionado.set(null);
    this.inicializarFormulario();
    this.vistaActual.set('formulario');
    this.limpiarMensaje();
  }
 
  abrirFormularioEdicion(gasto: GastoOperativo): void {
    this.modoEdicion.set(true);
    this.gastoSeleccionado.set(gasto);
    this.inicializarFormulario(gasto);
    this.vistaActual.set('formulario');
    this.limpiarMensaje();
  }
 
  // ─── Acciones CRUD ────────────────────────────────────────────────────────
  async cargarGastos(): Promise<void> {
    this.cargando.set(true);
    try {
      await this.gastoService.obtenerTodas();
    } catch {
      this.mostrarMensaje('Error al cargar los gastos', 'error');
    } finally {
      this.cargando.set(false);
    }
  }
 
  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    try {
      const valores = this.form.value;
      const gasto: GastoOperativo = {
        cantidad: Number(valores.cantidad),
        descripcion: valores.descripcion,
        fecha: new Date(valores.fecha),
        year: Number(valores.year)
      };
 
      if (this.modoEdicion() && this.gastoSeleccionado()?.id) {
        await this.gastoService.editar(this.gastoSeleccionado()!.id!, gasto);
        this.mostrarMensaje('Gasto actualizado correctamente', 'exito');
      } else {
        await this.gastoService.guardar(gasto);
        this.mostrarMensaje('Gasto registrado correctamente', 'exito');
      }
      setTimeout(() => this.irALista(), 1200);
    } catch {
      this.mostrarMensaje('Ocurrió un error. Intenta de nuevo.', 'error');
    } finally {
      this.cargando.set(false);
    }
  }
 
  confirmarEliminar(): void {
    this.mostrarConfirmEliminar.set(true);
  }
 
  cancelarEliminar(): void {
    this.mostrarConfirmEliminar.set(false);
  }
 
  async eliminar(): Promise<void> {
    const id = this.gastoSeleccionado()?.id;
    if (!id) return;
    this.cargando.set(true);
    try {
      await this.gastoService.borrar(id);
      this.mostrarConfirmEliminar.set(false);
      this.mostrarMensaje('Gasto eliminado', 'exito');
      setTimeout(() => this.irALista(), 900);
    } catch {
      this.mostrarMensaje('No se pudo eliminar el gasto', 'error');
    } finally {
      this.cargando.set(false);
    }
  }
 
  // ─── Filtros ──────────────────────────────────────────────────────────────
  onBusqueda(event: Event): void {
    this.terminoBusqueda.set((event.target as HTMLInputElement).value);
  }
 
  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.anioFiltro.set('');
  }
 
  onAnioChange(event: Event): void {
    this.anioFiltro.set((event.target as HTMLSelectElement).value);
  }
 
  // ─── Sincronización año/fecha en formulario ───────────────────────────────
  onFechaChange(): void {
    const fechaVal: string = this.form.get('fecha')?.value;
    if (fechaVal) {
      const anio = new Date(fechaVal).getFullYear() + 1; // compensar UTC offset
      this.form.patchValue({ year: anio }, { emitEvent: false });
    }
  }
 
  // ─── Helpers UI ──────────────────────────────────────────────────────────
  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.limpiarMensaje(), 3500);
  }
 
  private limpiarMensaje(): void {
    this.mensaje.set(null);
  }
 
  esInvalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.invalid && ctrl.touched);
  }
 
  trackById(_: number, g: GastoOperativo): string {
    return g.id ?? '';
  }


  
    setNav() {
      // this.checkFavorites();
      let navConfig: NavConfig = new NavConfig();
      navConfig.title = 'Gastos Operativos';
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
