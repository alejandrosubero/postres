import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPedidoCustomerDialogComponent } from './add-pedido-customer-dialog.component';

describe('AddPedidoCustomerDialogComponent', () => {
  let component: AddPedidoCustomerDialogComponent;
  let fixture: ComponentFixture<AddPedidoCustomerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPedidoCustomerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPedidoCustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
