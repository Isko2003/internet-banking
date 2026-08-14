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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
