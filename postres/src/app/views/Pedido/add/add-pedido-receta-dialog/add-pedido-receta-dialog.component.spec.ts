import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPedidoRecetaDialogComponent } from './add-pedido-receta-dialog.component';

describe('AddPedidoRecetaDialogComponent', () => {
  let component: AddPedidoRecetaDialogComponent;
  let fixture: ComponentFixture<AddPedidoRecetaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPedidoRecetaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPedidoRecetaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
