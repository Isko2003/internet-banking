import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MonthlyTrendPoint } from '../../../core/models/analytics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-trend-chart',
  standalone: true,
  templateUrl: './monthly-trend-chart.html',
})
export class MonthlyTrendChart implements AfterViewInit, OnChanges {
  @Input({ required: true }) data: MonthlyTrendPoint[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.chartInstance) {
      this.renderChart();
    }
  }

  private renderChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.data.map((d) => d.month),
        datasets: [
          {
            label: 'Gəlir',
            data: this.data.map((d) => d.income),
            backgroundColor: '#00B8A9',
            borderRadius: 4,
          },
          {
            label: 'Xərc',
            data: this.data.map((d) => d.expense),
            backgroundColor: '#E4572E',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}
