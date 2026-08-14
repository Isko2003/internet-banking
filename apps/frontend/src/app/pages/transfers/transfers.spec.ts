import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDependencies } from '../../../testing/test-providers';

import { Transfers } from './transfers';

describe('Transfers', () => {
  let component: Transfers;
  let fixture: ComponentFixture<Transfers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transfers],
      providers: [provideTestingDependencies()],
    }).compileComponents();

    fixture = TestBed.createComponent(Transfers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
