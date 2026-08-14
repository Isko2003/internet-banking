import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountRow } from './account-row';

describe('AccountRow', () => {
  let component: AccountRow;
  let fixture: ComponentFixture<AccountRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountRow],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('account', {
      id: '1',
      name: 'Main Account',
      iban: 'AZ00 0000 0000 0000 0000 0000',
      balance: 1000,
      currency: 'AZN',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
