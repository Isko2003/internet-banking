import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDependencies } from '../../../testing/test-providers';

import { CardDetail } from './card-detail';

describe('CardDetail', () => {
  let component: CardDetail;
  let fixture: ComponentFixture<CardDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDetail],
      providers: [provideTestingDependencies()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
