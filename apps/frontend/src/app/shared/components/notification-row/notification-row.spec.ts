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
    fixture.componentRef.setInput('notification', {
      id: '1',
      title: 'Card expiring soon',
      message: 'Your card ending in 1111 expires next month.',
      read: false,
      createdAt: new Date().toISOString(),
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});