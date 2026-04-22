import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>📊 Panel de Disponibilidad de Tiendas</h1>

      <div class="kpi-cards">
        <div class="kpi-card">
          <h3>Tiendas Máximas</h3>
          <p class="value">{{ maxValue | number:'1.0-0' }}</p>
          <span class="label">Máximo histórico</span>
        </div>

        <div class="kpi-card">
          <h3>Tiendas Mínimas</h3>
          <p class="value">{{ minValue | number:'1.0-0' }}</p>
          <span class="label">Punto más bajo</span>
        </div>

        <div class="kpi-card">
          <h3>Promedio</h3>
          <p class="value">{{ avgValue | number:'1.0-0' }}</p>
          <span class="label">Promedio histórico</span>
        </div>

        <div class="kpi-card">
          <h3>Registros</h3>
          <p class="value">{{ dataCount | number }}</p>
          <span class="label">Datos analizados</span>
        </div>
      </div>

      <div class="chart-section">
        <h2>📈 Tiendas Disponibles en el Tiempo</h2>
        <canvas id="timeseriesChart"></canvas>
      </div>

      <div class="chart-row">
        <div class="chart-section chart-half">
          <h2>📊 Promedio Diario</h2>
          <canvas id="dailyChart"></canvas>
        </div>
        <div class="chart-section chart-half">
          <h2>⏰ Patrón Horario (Ciclo Diurno)</h2>
          <canvas id="hourlyChart"></canvas>
        </div>
      </div>

      <div class="chart-section">
        <h2>📉 Min/Max/Promedio por Día</h2>
        <canvas id="rangeChart"></canvas>
      </div>

      <div class="loading" *ngIf="loading">
        <p>⏳ Cargando datos...</p>
      </div>

      <div class="error" *ngIf="error">
        <p>❌ Error: {{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 0;
      background: transparent;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    h1 {
      color: #0f172a;
      text-align: left;
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: 700;
    }

    .kpi-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: #ffffff;
      backdrop-filter: none;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: transparent;
      transition: left 0.5s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      border-color: #FF441A;
      box-shadow: 0 4px 12px rgba(255, 68, 26, 0.12);
    }

    .kpi-card:hover::before {
      left: 100%;
    }

    .kpi-card h3 {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }

    .kpi-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #FF441A;
      margin: 8px 0;
    }

    .kpi-card .label {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 500;
    }

    .chart-section {
      background: #ffffff;
      backdrop-filter: none;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      margin-top: 24px;
    }

    .chart-section h2 {
      color: #0f172a;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
    }

    canvas {
      max-width: 100%;
      height: 380px;
      display: block;
    }

    .loading, .error {
      text-align: center;
      padding: 24px;
      background: #ffffff;
      backdrop-filter: none;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-top: 20px;
    }

    .error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .loading {
      color: #FF441A;
      font-weight: 500;
    }

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }

    .chart-half {
      margin-top: 0;
    }

    @media (max-width: 1200px) {
      .chart-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  maxValue = 0;
  minValue = 0;
  avgValue = 0;
  dataCount = 0;

  chartData: any[] = [];

  private charts: { [key: string]: Chart } = {};

  ngOnDestroy() {
    Object.values(this.charts).forEach(c => c.destroy());
  }

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.dataService.getData().subscribe({
      next: (response) => {
        console.log('Response received:', response);
        this.maxValue = response.max_value || 0;
        this.minValue = response.min_value || 0;
        this.avgValue = response.avg_value || 0;
        this.dataCount = response.count || 0;
        this.chartData = response.data || [];

        console.log('Data loaded. Count:', this.dataCount);
        this.loading = false;

        this.cdr.markForCheck();

        if (this.chartData.length > 0) {
          setTimeout(() => {
            this.drawChart();
            this.drawDailyChart();
            this.drawHourlyChart();
            this.drawRangeChart();
          }, 100);
        }
      },
      error: (err) => {
        this.error = err.error?.detail || err.message || 'Error loading data from server';
        this.loading = false;
        console.error('Full Error:', err);
      }
    });
  }

  private aggregateByDay(): { date: string; avg: number; min: number; max: number }[] {
    const dayMap = new Map<string, number[]>();

    this.chartData.forEach(d => {
      const date = new Date(d.timestamp).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      if (!dayMap.has(date)) dayMap.set(date, []);
      dayMap.get(date)!.push(d.value);
    });

    const result: { date: string; avg: number; min: number; max: number }[] = [];
    dayMap.forEach((values, date) => {
      result.push({
        date,
        avg: values.reduce((a, b) => a + b) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      });
    });

    return result;
  }

  private aggregateByHour(): { hour: number; avg: number }[] {
    const hourMap = new Map<number, number[]>();

    this.chartData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      if (!hourMap.has(hour)) hourMap.set(hour, []);
      hourMap.get(hour)!.push(d.value);
    });

    const result: { hour: number; avg: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const values = hourMap.get(h) || [];
      result.push({
        hour: h,
        avg: values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0
      });
    }

    return result;
  }

  private fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toFixed(0);
  }

  private destroyChart(id: string) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }

  drawChart() {
    this.destroyChart('timeseries');
    const canvas = document.getElementById('timeseriesChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Sample every 50 points to keep rendering fast
    const step = Math.max(1, Math.floor(this.chartData.length / 500));
    const sampled = this.chartData.filter((_, i) => i % step === 0);

    const labels = sampled.map(d => {
      const dt = new Date(d.timestamp);
      return dt.toLocaleDateString('es-CO', { month: 'short', day: '2-digit' });
    });

    this.charts['timeseries'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Tiendas visibles',
          data: sampled.map(d => d.value),
          borderColor: '#FF441A',
          backgroundColor: 'rgba(255,68,26,0.06)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ctx.parsed.y != null ? ` ${this.fmt(ctx.parsed.y)} tiendas` : ''
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', maxTicksLimit: 11 }, grid: { display: false } },
          y: {
            ticks: { color: '#94a3b8', callback: (v) => v != null ? this.fmt(v as number) : '' },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }

  drawDailyChart() {
    this.destroyChart('daily');
    const canvas = document.getElementById('dailyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const data = this.aggregateByDay();

    this.charts['daily'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Promedio diario',
          data: data.map(d => d.avg),
          backgroundColor: 'rgba(255,68,26,0.85)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ctx.parsed.y != null ? ` Promedio: ${this.fmt(ctx.parsed.y)} tiendas` : ''
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: {
            ticks: { color: '#94a3b8', callback: (v) => v != null ? this.fmt(v as number) : '' },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }

  drawHourlyChart() {
    this.destroyChart('hourly');
    const canvas = document.getElementById('hourlyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const data = this.aggregateByHour();

    this.charts['hourly'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => `${d.hour}:00`),
        datasets: [{
          label: 'Promedio por hora',
          data: data.map(d => d.avg),
          borderColor: '#FF441A',
          backgroundColor: 'rgba(255,68,26,0.08)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#FF441A',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ctx.parsed.y != null ? ` ${this.fmt(ctx.parsed.y)} tiendas` : ''
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: {
            ticks: { color: '#94a3b8', callback: (v) => v != null ? this.fmt(v as number) : '' },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }

  drawRangeChart() {
    this.destroyChart('range');
    const canvas = document.getElementById('rangeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const data = this.aggregateByDay();

    this.charts['range'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Máximo',
            data: data.map(d => d.max),
            borderColor: '#dc2626',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#dc2626',
            tension: 0.3
          },
          {
            label: 'Promedio',
            data: data.map(d => d.avg),
            borderColor: '#FF441A',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#FF441A',
            tension: 0.3
          },
          {
            label: 'Mínimo',
            data: data.map(d => d.min),
            borderColor: '#0891b2',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#0891b2',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#475569', usePointStyle: true, pointStyleWidth: 10 }
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ctx.parsed.y != null ? ` ${ctx.dataset.label}: ${this.fmt(ctx.parsed.y)} tiendas` : ''
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: {
            ticks: { color: '#94a3b8', callback: (v) => v != null ? this.fmt(v as number) : '' },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }
}
