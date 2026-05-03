import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListIngredienteComponent } from './list-ingrediente.component';

describe('ListIngredienteComponent', () => {
  let component: ListIngredienteComponent;
  let fixture: ComponentFixture<ListIngredienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListIngredienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
