import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAlertasComponent } from './dashboard-alertas.component';

describe('DashboardAlertasComponent', () => {
  let component: DashboardAlertasComponent;
  let fixture: ComponentFixture<DashboardAlertasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAlertasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardAlertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
