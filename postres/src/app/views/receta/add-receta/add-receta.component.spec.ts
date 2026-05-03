import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecetaComponent } from './add-receta.component';

describe('AddRecetaComponent', () => {
  let component: AddRecetaComponent;
  let fixture: ComponentFixture<AddRecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRecetaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
