import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDependencies } from '../../../testing/test-providers';

import { Payments } from './payments';

describe('Payments', () => {
  let component: Payments;
  let fixture: ComponentFixture<Payments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Payments],
      providers: [provideTestingDependencies()],
    }).compileComponents();

    fixture = TestBed.createComponent(Payments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
