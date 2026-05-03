import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIngredienteDialogComponent } from './add-ingrediente-dialog.component';

describe('AddIngredienteDialogComponent', () => {
  let component: AddIngredienteDialogComponent;
  let fixture: ComponentFixture<AddIngredienteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIngredienteDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddIngredienteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
