import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidoService } from '../../../../services/data/pedido.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Customer } from '../../../../models/customer.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IdGeneratorService } from '../../../../services/data/id-generator-service.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-add-pedido-customer-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  templateUrl: './add-pedido-customer-dialog.component.html',
  styleUrl: './add-pedido-customer-dialog.component.scss'
})
export class AddPedidoCustomerDialogComponent implements OnInit {

  private pedidoService = inject(PedidoService);
  private fb = inject(FormBuilder);
  public customerList: Customer[] = this.pedidoService.customers();
  private idGenerator = inject(IdGeneratorService);
  private dialogRef = inject(MatDialogRef);

  filteredCustomers!: Observable<Customer[]>;


  form: FormGroup = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    email: [''],
    phoneNumber: [''],
    address: [''],
    notas: ['']
  });

  ngOnInit() {
    // // Configuramos el filtro reactivo sobre el campo 'name'
    // this.filteredCustomers = this.form.get('name')!.valueChanges.pipe(
    //   startWith(''),
    //   map(value => {
    //     const name = typeof value === 'string' ? value : value?.name;
    //     return name ? this._filter(name) : this.customerList.slice();
    //   })
    // );
  
    this.filteredCustomers = this.form.get('name')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;

        // LÓGICA DE LIMPIEZA: 
        if (!name || name.trim() === '') {
          this.limpiarCamposAsociados();
        }
        return name ? this._filter(name) : this.customerList.slice();
      })
    );

  }

  private limpiarCamposAsociados() {
    this.form.patchValue({
      id: '',
      email: '',
      phoneNumber: '',
      address: '',
      notas: ''
    }, { emitEvent: false });
  }

  displayFn(customer: any): string {

    if (customer && typeof customer === 'object') {
      return customer.name || '';
    }
    return customer || '';
  }

  private _filter(name: string): Customer[] {
    const filterValue = name.toLowerCase();
    return this.customerList.filter(customer =>
      customer.name.toLowerCase().includes(filterValue)
    );
  }


  onCustomerSelected(event: MatAutocompleteSelectedEvent) {
    const customer: Customer = event.option.value;

    if (customer) {
      // Seteamos todo el formulario
      this.form.patchValue({
        id: customer.id,
        name: customer, // <--- IMPORTANTE: Pasa el objeto completo aquí
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        notas: customer.notas
      }, { emitEvent: false });

      // Opcional: Si quieres que el cursor se mueva al final del texto
      // o asegurar que Angular detecte el cambio de vista:
      this.form.get('name')?.markAsDirty();
    }
  }

  // onCustomerSelected(event: MatAutocompleteSelectedEvent) {
  //   // El objeto Customer completo está en event.option.value
  //   const customer: Customer = event.option.value;

  //   if (customer) {
  //     this.form.patchValue({
  //       id: customer.id,
  //       name: customer.name, 
  //       email: customer.email,
  //       phoneNumber: customer.phoneNumber,
  //       address: customer.address,
  //       notas: customer.notas
  //     });

  //     console.log('Cliente autocompletado:', customer);
  //   }
  // }




  guardar() {
    const val = this.form.value.name;
    const finalName = typeof val === 'string' ? val : val.name;
    this.dialogRef.close({
      id: this.form.value.id || this.idGenerator.generateId(),
      name: finalName,
      email: this.form.value.email,
      phoneNumber: this.form.value.phoneNumber,
      notas: this.form.value.notas,
      address: this.form.value.address,
    });
  }



}


