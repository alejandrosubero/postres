import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailIngredienteComponent } from './detail-ingrediente.component';

describe('DetailIngredienteComponent', () => {
  let component: DetailIngredienteComponent;
  let fixture: ComponentFixture<DetailIngredienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailIngredienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
