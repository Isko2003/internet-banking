import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPanel } from './dashboard-panel';

describe('DashboardPanel', () => {
  let component: DashboardPanel;
  let fixture: ComponentFixture<DashboardPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
