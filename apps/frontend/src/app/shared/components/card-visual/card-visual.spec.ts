import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardVisual } from './card-visual';

describe('CardVisual', () => {
  let component: CardVisual;
  let fixture: ComponentFixture<CardVisual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardVisual],
    }).compileComponents();

    fixture = TestBed.createComponent(CardVisual);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', {
      id: '1',
      number: '4111 1111 1111 1111',
      paymentSystem: 'visa',
      holderName: 'JOHN DOE',
      expiry: '12/28',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});