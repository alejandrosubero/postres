import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRecetasComponent } from './dashboard-recetas.component';

describe('DashboardRecetasComponent', () => {
  let component: DashboardRecetasComponent;
  let fixture: ComponentFixture<DashboardRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecetasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
