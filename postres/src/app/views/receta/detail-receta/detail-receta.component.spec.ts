import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailRecetaComponent } from './detail-receta.component';

describe('DetailRecetaComponent', () => {
  let component: DetailRecetaComponent;
  let fixture: ComponentFixture<DetailRecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailRecetaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
