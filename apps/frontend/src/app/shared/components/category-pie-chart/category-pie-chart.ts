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
import { CategoryBreakDown } from '../../../core/models/analytics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-category-pie-chart',
  standalone: true,
  templateUrl: './category-pie-chart.html',
})
export class CategoryPieChart implements AfterViewInit, OnChanges {
  @Input({ required: true }) data: CategoryBreakDown[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  private readonly palette = ['#1B2A4B', '#00B8A9', '#E4572E', '#F4A261', '#6B7280', '#8B5CF6'];

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
      type: 'pie',
      data: {
        labels: this.data.map((d) => d.category),
        datasets: [
          {
            data: this.data.map((d) => d.amount),
            backgroundColor: this.palette,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed} AZN`,
            },
          },
        },
      },
    });
  }
}
