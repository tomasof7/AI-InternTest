import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div class="header-row">
          <div>
            <h1>Panel de Disponibilidad</h1>
            <p>Análisis de 67,141 registros · 01–11 Febrero 2026</p>
          </div>
          <div class="header-badges">
            <span class="badge badge-green">● En línea</span>
            <span class="badge badge-orange">Tiempo real</span>
          </div>
        </div>
      </div>

      <!-- Skeleton while loading -->
      <div *ngIf="loading" class="kpi-grid">
        <div *ngFor="let i of [0,1,2,3]" class="kpi-card">
          <div class="skeleton" style="width:80px;height:11px;margin-bottom:12px"></div>
          <div class="skeleton" style="width:120px;height:30px;margin-bottom:8px"></div>
          <div class="skeleton" style="width:60px;height:10px"></div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div *ngIf="!loading" class="kpi-grid fade-in">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-top">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-icon" [innerHTML]="kpi.icon"></span>
          </div>
          <p class="kpi-value">{{ kpi.value | number:'1.0-0' }}</p>
          <p class="kpi-sub">{{ kpi.sub }}</p>
          <div class="kpi-bar" *ngIf="kpi.pct !== null">
            <div class="kpi-bar-fill" [style.width.%]="kpi.pct"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-card fade-in">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ error }}</span>
      </div>

      <!-- Charts grid -->
      <div *ngIf="!loading && !error" class="charts-layout fade-in">

        <!-- Time series - full width -->
        <div class="card chart-card chart-full">
          <div class="chart-header">
            <div>
              <h3>Tiendas Disponibles en el Tiempo</h3>
              <p>Serie completa muestreada · granularidad 10s</p>
            </div>
            <span class="badge badge-orange">{{ dataCount | number }} pts</span>
          </div>
          <div class="chart-wrap">
            <canvas id="timeseriesChart"></canvas>
          </div>
        </div>

        <!-- Daily + Hourly side by side -->
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3>Promedio Diario</h3>
              <p>Tiendas visibles por día</p>
            </div>
          </div>
          <div class="chart-wrap chart-wrap-sm">
            <canvas id="dailyChart"></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3>Patrón Horario</h3>
              <p>Ciclo diurno promedio (0–23h)</p>
            </div>
          </div>
          <div class="chart-wrap chart-wrap-sm">
            <canvas id="hourlyChart"></canvas>
          </div>
        </div>

        <!-- Range chart - full width -->
        <div class="card chart-card chart-full">
          <div class="chart-header">
            <div>
              <h3>Rango Diario: Mín / Promedio / Máx</h3>
              <p>Variación de disponibilidad por día</p>
            </div>
            <div class="legend-pills">
              <span class="legend-pill" style="--c:#dc2626">Máximo</span>
              <span class="legend-pill" style="--c:#FF441A">Promedio</span>
              <span class="legend-pill" style="--c:#0891b2">Mínimo</span>
            </div>
          </div>
          <div class="chart-wrap">
            <canvas id="rangeChart"></canvas>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .header-badges {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 2px;
    }

    /* KPI */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 22px;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition);
    }

    .kpi-card:hover {
      border-color: var(--brand);
      box-shadow: 0 4px 16px rgba(255,68,26,0.1);
      transform: translateY(-2px);
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .kpi-icon {
      width: 28px;
      height: 28px;
      background: var(--brand-light);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }

    .kpi-icon ::ng-deep svg {
      width: 14px;
      height: 14px;
    }

    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      line-height: 1;
      margin-bottom: 5px;
    }

    .kpi-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .kpi-bar {
      height: 3px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
    }

    .kpi-bar-fill {
      height: 100%;
      background: var(--brand);
      border-radius: 99px;
      transition: width 0.8s ease;
    }

    /* Charts */
    .charts-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .chart-card {
      padding: 22px 24px;
    }

    .chart-full {
      grid-column: 1 / -1;
    }

    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .chart-header h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .chart-header p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .chart-wrap {
      position: relative;
      height: 280px;
    }

    .chart-wrap canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .chart-wrap-sm {
      height: 220px;
    }

    .legend-pills {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .legend-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .legend-pill::before {
      content: '';
      width: 10px;
      height: 2px;
      background: var(--c);
      border-radius: 99px;
      display: inline-block;
    }

    /* Error */
    .error-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      color: #dc2626;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    @media (max-width: 1100px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-layout { grid-template-columns: 1fr; }
      .chart-full { grid-column: auto; }
    }

    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class DashboardPage implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  maxValue = 0;
  minValue = 0;
  avgValue = 0;
  dataCount = 0;
  chartData: any[] = [];

  kpis: any[] = [];

  private charts: { [key: string]: Chart } = {};

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadData(); }

  ngOnDestroy() { Object.values(this.charts).forEach(c => c.destroy()); }

  loadData() {
    this.loading = true;
    this.error = null;

    this.dataService.getData().subscribe({
      next: (response) => {
        this.maxValue = response.max_value || 0;
        this.minValue = response.min_value || 0;
        this.avgValue = response.avg_value || 0;
        this.dataCount = response.count || 0;
        this.chartData = response.data || [];
        this.loading = false;

        this.kpis = [
          {
            label: 'Máximo',
            value: this.maxValue,
            sub: 'Pico histórico',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
            pct: 100
          },
          {
            label: 'Mínimo',
            value: this.minValue,
            sub: 'Punto más bajo',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
            pct: this.maxValue > 0 ? (this.minValue / this.maxValue) * 100 : 0
          },
          {
            label: 'Promedio',
            value: this.avgValue,
            sub: 'Media histórica',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            pct: this.maxValue > 0 ? (this.avgValue / this.maxValue) * 100 : 0
          },
          {
            label: 'Registros',
            value: this.dataCount,
            sub: 'Datos analizados',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            pct: null
          }
        ];

        this.cdr.markForCheck();

        if (this.chartData.length > 0) {
          setTimeout(() => {
            this.drawChart();
            this.drawDailyChart();
            this.drawHourlyChart();
            this.drawRangeChart();
          }, 120);
        }
      },
      error: (err) => {
        this.error = err.error?.detail || err.message || 'Error cargando datos del servidor';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private aggregateByDay() {
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

  private aggregateByHour() {
    const hourMap = new Map<number, number[]>();
    this.chartData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      if (!hourMap.has(hour)) hourMap.set(hour, []);
      hourMap.get(hour)!.push(d.value);
    });
    const result: { hour: number; avg: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const values = hourMap.get(h) || [];
      result.push({ hour: h, avg: values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0 });
    }
    return result;
  }

  private fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toFixed(0);
  }

  private destroyChart(id: string) {
    if (this.charts[id]) { this.charts[id].destroy(); delete this.charts[id]; }
  }

  private chartDefaults() {
    return {
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      },
      scaleX: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } },
      scaleY: {
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v: any) => v != null ? this.fmt(v as number) : '' },
        grid: { color: '#f1f5f9', drawBorder: false }
      }
    };
  }

  drawChart() {
    this.destroyChart('timeseries');
    const canvas = document.getElementById('timeseriesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const step = Math.max(1, Math.floor(this.chartData.length / 500));
    const sampled = this.chartData.filter((_, i) => i % step === 0);
    const d = this.chartDefaults();

    this.charts['timeseries'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: sampled.map(d => {
          const dt = new Date(d.timestamp);
          return dt.toLocaleDateString('es-CO', { month: 'short', day: '2-digit' });
        }),
        datasets: [{
          label: 'Tiendas visibles',
          data: sampled.map(d => d.value),
          borderColor: '#FF441A',
          backgroundColor: 'rgba(255,68,26,0.05)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...d.tooltip, callbacks: { label: ctx => ctx.parsed.y != null ? ` ${this.fmt(ctx.parsed.y)} tiendas` : '' } }
        },
        scales: {
          x: { ...d.scaleX, ticks: { ...d.scaleX.ticks, maxTicksLimit: 11 } },
          y: d.scaleY
        }
      }
    });
  }

  drawDailyChart() {
    this.destroyChart('daily');
    const canvas = document.getElementById('dailyChart') as HTMLCanvasElement;
    if (!canvas) return;
    const data = this.aggregateByDay();
    const d = this.chartDefaults();

    this.charts['daily'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Promedio diario',
          data: data.map(d => d.avg),
          backgroundColor: 'rgba(255,68,26,0.8)',
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: '#FF441A'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...d.tooltip, callbacks: { label: ctx => ctx.parsed.y != null ? ` ${this.fmt(ctx.parsed.y)} tiendas` : '' } }
        },
        scales: { x: d.scaleX, y: d.scaleY }
      }
    });
  }

  drawHourlyChart() {
    this.destroyChart('hourly');
    const canvas = document.getElementById('hourlyChart') as HTMLCanvasElement;
    if (!canvas) return;
    const data = this.aggregateByHour();
    const d = this.chartDefaults();

    this.charts['hourly'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => `${d.hour}h`),
        datasets: [{
          label: 'Promedio por hora',
          data: data.map(d => d.avg),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.07)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#6366f1',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...d.tooltip, callbacks: { label: ctx => ctx.parsed.y != null ? ` ${this.fmt(ctx.parsed.y)} tiendas` : '' } }
        },
        scales: { x: d.scaleX, y: d.scaleY }
      }
    });
  }

  drawRangeChart() {
    this.destroyChart('range');
    const canvas = document.getElementById('rangeChart') as HTMLCanvasElement;
    if (!canvas) return;
    const data = this.aggregateByDay();
    const d = this.chartDefaults();

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
            backgroundColor: 'rgba(255,68,26,0.06)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#FF441A',
            tension: 0.3,
            fill: true
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
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...d.tooltip, callbacks: { label: ctx => ctx.parsed.y != null ? ` ${ctx.dataset.label}: ${this.fmt(ctx.parsed.y)}` : '' } }
        },
        scales: { x: d.scaleX, y: d.scaleY }
      }
    });
  }
}
