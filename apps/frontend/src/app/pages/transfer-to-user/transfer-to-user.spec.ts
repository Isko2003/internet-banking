import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferToUser } from './transfer-to-user';

describe('TransferToUser', () => {
  let component: TransferToUser;
  let fixture: ComponentFixture<TransferToUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferToUser],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferToUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
