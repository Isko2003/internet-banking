import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationRow } from './notification-row';

describe('NotificationRow', () => {
  let component: NotificationRow;
  let fixture: ComponentFixture<NotificationRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationRow],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
