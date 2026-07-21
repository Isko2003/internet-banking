import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRow } from './transaction-row';

describe('TransactionRow', () => {
  let component: TransactionRow;
  let fixture: ComponentFixture<TransactionRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionRow],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
