import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIngredienteComponent } from './add-ingrediente.component';

describe('AddIngredienteComponent', () => {
  let component: AddIngredienteComponent;
  let fixture: ComponentFixture<AddIngredienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIngredienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
