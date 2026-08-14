import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardRow } from './card-row';

describe('CardRow', () => {
  let component: CardRow;
  let fixture: ComponentFixture<CardRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRow],
    }).compileComponents();

    fixture = TestBed.createComponent(CardRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', {
      id: '1',
      number: '4111 1111 1111 1111',
      paymentSystem: 'visa',
      status: 'active',
      expiry: '12/28',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});