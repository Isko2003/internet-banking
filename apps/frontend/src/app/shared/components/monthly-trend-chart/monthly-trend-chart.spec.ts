import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTrendChart } from './monthly-trend-chart';

describe('MonthlyTrendChart', () => {
  let component: MonthlyTrendChart;
  let fixture: ComponentFixture<MonthlyTrendChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTrendChart],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyTrendChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
