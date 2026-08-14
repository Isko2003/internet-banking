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
    fixture.componentRef.setInput('transaction', {
      id: '1',
      description: 'Grocery Store',
      amount: -45.5,
      currency: 'AZN',
      date: new Date().toISOString(),
      category: 'shopping',
      status: 'completed',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});