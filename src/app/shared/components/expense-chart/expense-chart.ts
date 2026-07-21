import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Transaction } from '../../../core/models/transaction.model';

Chart.register(...registerables);

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './expense-chart.html',
})
export class ExpenseChart implements AfterViewInit, OnChanges {
  @Input({ required: true }) transactions: Transaction[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance: Chart | null = null;

  totalExpense = signal(0);
  categoryBreakdown = signal<{ category: string; amount: number; percentage: number; color: string }[]>([]);

  private readonly palette = ['#1B2A4B', '#00B8A9', '#E4572E', '#F4A261', '#6B7280', '#8B5CF6'];

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.computeBreakdown();
      if (this.chartInstance) {
        this.renderChart();
      }
    }
  }

  private computeBreakdown() {
    const grouped = this.groupByCategory(this.transactions);
    const total = Object.values(grouped).reduce((sum, v) => sum + v, 0);

    this.totalExpense.set(total);
    this.categoryBreakdown.set(
      Object.entries(grouped)
        .sort(([, a], [, b]) => b - a) // ən böyük xərcdən başlayaraq sırala
        .map(([category, amount], index) => ({
          category,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          color: this.palette[index % this.palette.length],
        }))
    );
  }

  private renderChart() {
    const grouped = this.groupByCategory(this.transactions);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(grouped),
        datasets: [{
          data: Object.values(grouped),
          backgroundColor: this.palette,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // ortadakı boşluğu böyüdür, "ümumi məbləğ" mətni üçün yer
        plugins: {
          legend: { display: false }, // öz custom legend-imizi yazacayıq, default-u gizlədirik
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed} AZN`,
            },
          },
        },
      },
    });
  }

  private groupByCategory(transactions: Transaction[]): Record<string, number> {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }
}