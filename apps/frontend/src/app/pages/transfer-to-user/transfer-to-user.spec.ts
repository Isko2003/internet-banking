import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDependencies } from '../../../testing/test-providers';

import { TransferToUser } from './transfer-to-user';

describe('TransferToUser', () => {
  let component: TransferToUser;
  let fixture: ComponentFixture<TransferToUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferToUser],
      providers: [provideTestingDependencies()],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferToUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
