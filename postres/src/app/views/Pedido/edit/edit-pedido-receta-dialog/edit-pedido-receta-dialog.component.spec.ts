import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPedidoRecetaDialogComponent } from './edit-pedido-receta-dialog.component';

describe('EditPedidoRecetaDialogComponent', () => {
  let component: EditPedidoRecetaDialogComponent;
  let fixture: ComponentFixture<EditPedidoRecetaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPedidoRecetaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPedidoRecetaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
