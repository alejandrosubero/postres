import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IosAlertDialogComponent } from './ios-alert-dialog.component';

describe('IosAlertDialogComponent', () => {
  let component: IosAlertDialogComponent;
  let fixture: ComponentFixture<IosAlertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IosAlertDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IosAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
