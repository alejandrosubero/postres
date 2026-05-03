import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarAgendaComponent } from './calendar-agenda.component';

describe('CalendarAgendaComponent', () => {
  let component: CalendarAgendaComponent;
  let fixture: ComponentFixture<CalendarAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarAgendaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
