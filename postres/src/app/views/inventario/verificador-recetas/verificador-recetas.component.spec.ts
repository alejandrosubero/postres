import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificadorRecetasComponent } from './verificador-recetas.component';

describe('VerificadorRecetasComponent', () => {
  let component: VerificadorRecetasComponent;
  let fixture: ComponentFixture<VerificadorRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificadorRecetasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerificadorRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
