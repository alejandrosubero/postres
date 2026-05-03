import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPedidoCustomerDialogComponent } from './edit-pedido-customer-dialog.component';

describe('EditPedidoCustomerDialogComponent', () => {
  let component: EditPedidoCustomerDialogComponent;
  let fixture: ComponentFixture<EditPedidoCustomerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPedidoCustomerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPedidoCustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
