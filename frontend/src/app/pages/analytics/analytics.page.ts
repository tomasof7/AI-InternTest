import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

interface DayStat {
  date: string;
  avg: number;
  min: number;
  max: number;
  range: number;
  count: number;
  pct: number;
}

interface HourStat {
  hour: string;
  avg: number;
  pct: number;
}

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Análisis detallado de disponibilidad · 67,141 registros procesados</p>
      </div>

      <!-- Skeleton -->
      <div *ngIf="loading" class="skeleton-grid">
        <div *ngFor="let i of [0,1,2,3,4,5]" class="skeleton" style="height:80px;border-radius:14px"></div>
      </div>

      <div *ngIf="!loading && !error" class="analytics-layout fade-in">

        <!-- Section: By Day -->
        <section class="section">
          <div class="section-title-row">
            <h2>Análisis por Día</h2>
            <span class="badge badge-blue">11 días</span>
          </div>
          <div class="table-card card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Promedio</th>
                  <th>Mínimo</th>
                  <th>Máximo</th>
                  <th>Rango</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of dayStats; let i = index" [class.highlight]="i === peakDayIndex">
                  <td class="date-cell">
                    <span>{{ d.date }}</span>
                    <span *ngIf="i === peakDayIndex" class="inline-badge badge-orange">Pico</span>
                    <span *ngIf="i === lowDayIndex" class="inline-badge badge-blue">Mínimo</span>
                  </td>
                  <td class="num">{{ fmt(d.avg) }}</td>
                  <td class="num muted">{{ fmt(d.min) }}</td>
                  <td class="num">{{ fmt(d.max) }}</td>
                  <td class="num muted">{{ fmt(d.range) }}</td>
                  <td>
                    <div class="bar-cell">
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="d.pct" [class.bar-peak]="i === peakDayIndex"></div>
                      </div>
                      <span class="bar-pct">{{ d.pct | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section: By Hour -->
        <section class="section">
          <div class="section-title-row">
            <h2>Patrón Horario</h2>
            <span class="badge badge-purple">24 horas</span>
          </div>
          <div class="hour-grid">
            <div
              *ngFor="let h of hourStats"
              class="hour-card card"
              [class.hour-peak]="h.pct === 100"
              [class.hour-low]="h.pct < 30"
            >
              <div class="hour-time">{{ h.hour }}</div>
              <div class="hour-bar">
                <div class="hour-bar-fill" [style.height.%]="h.pct"></div>
              </div>
              <div class="hour-val">{{ fmt(h.avg) }}</div>
            </div>
          </div>
        </section>

        <!-- Insights cards -->
        <section class="section">
          <div class="section-title-row">
            <h2>Insights clave</h2>
            <span class="badge badge-green">Auto-generados</span>
          </div>
          <div class="insights-grid">
            <div class="insight-card card" *ngFor="let ins of insights">
              <div class="insight-icon" [style.background]="ins.bg">
                <span [innerHTML]="ins.icon"></span>
              </div>
              <div class="insight-body">
                <h4>{{ ins.title }}</h4>
                <p>{{ ins.desc }}</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div *ngIf="error" class="error-card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .analytics-layout {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .section-title-row h2 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Table */
    .table-card { overflow: hidden; padding: 0; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      padding: 12px 18px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-muted);
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }

    .data-table td {
      padding: 13px 18px;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
    }

    .data-table tbody tr:last-child td { border-bottom: none; }

    .data-table tbody tr:hover { background: var(--surface-2); }

    .data-table tbody tr.highlight { background: var(--brand-light); }

    .date-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }

    .num { font-variant-numeric: tabular-nums; font-weight: 500; }
    .muted { color: var(--text-muted); }

    .inline-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 99px;
    }
    .badge-orange { background: var(--brand-light); color: var(--brand); }
    .badge-blue { background: #eff6ff; color: #2563eb; }

    .bar-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bar-track {
      flex: 1;
      height: 5px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
      min-width: 80px;
    }

    .bar-fill {
      height: 100%;
      background: var(--brand);
      border-radius: 99px;
      transition: width 0.8s ease;
    }

    .bar-fill.bar-peak { background: #22c55e; }

    .bar-pct {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      min-width: 30px;
    }

    /* Hour grid */
    .hour-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 8px;
    }

    .hour-card {
      padding: 10px 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border-radius: var(--radius-md);
    }

    .hour-peak { border-color: #22c55e; background: #f0fdf4; }
    .hour-low { opacity: 0.6; }

    .hour-time {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .hour-bar {
      width: 100%;
      height: 40px;
      background: var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .hour-bar-fill {
      width: 100%;
      background: var(--brand);
      border-radius: var(--radius-sm);
      transition: height 0.8s ease;
      opacity: 0.7;
    }

    .hour-peak .hour-bar-fill { background: #22c55e; opacity: 1; }

    .hour-val {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    /* Insights */
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .insight-card {
      padding: 18px 20px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .insight-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .insight-icon ::ng-deep svg {
      width: 18px;
      height: 18px;
    }

    .insight-body h4 {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .insight-body p {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

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
    }

    @media (max-width: 1000px) {
      .hour-grid { grid-template-columns: repeat(8, 1fr); }
      .insights-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 700px) {
      .hour-grid { grid-template-columns: repeat(6, 1fr); }
      .insights-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsPage implements OnInit {
  loading = true;
  error: string | null = null;

  dayStats: DayStat[] = [];
  hourStats: HourStat[] = [];
  insights: any[] = [];
  peakDayIndex = 0;
  lowDayIndex = 0;

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dataService.getData().subscribe({
      next: (response) => {
        const data: any[] = response.data || [];
        const maxGlobal = response.max_value || 1;
        const avgGlobal = response.avg_value || 0;

        // Day aggregation
        const dayMap = new Map<string, number[]>();
        data.forEach((d: any) => {
          const date = new Date(d.timestamp).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' });
          if (!dayMap.has(date)) dayMap.set(date, []);
          dayMap.get(date)!.push(d.value);
        });

        const rawDays: DayStat[] = [];
        dayMap.forEach((vals, date) => {
          const avg = vals.reduce((a, b) => a + b) / vals.length;
          const min = Math.min(...vals);
          const max = Math.max(...vals);
          rawDays.push({ date, avg, min, max, range: max - min, count: vals.length, pct: 0 });
        });

        const maxAvg = Math.max(...rawDays.map(d => d.avg));
        this.dayStats = rawDays.map(d => ({ ...d, pct: (d.avg / maxAvg) * 100 }));
        this.peakDayIndex = this.dayStats.findIndex(d => d.avg === maxAvg);
        this.lowDayIndex = this.dayStats.findIndex(d => d.avg === Math.min(...this.dayStats.map(d => d.avg)));

        // Hour aggregation
        const hourMap = new Map<number, number[]>();
        data.forEach((d: any) => {
          const h = new Date(d.timestamp).getHours();
          if (!hourMap.has(h)) hourMap.set(h, []);
          hourMap.get(h)!.push(d.value);
        });

        const rawHours: HourStat[] = [];
        for (let h = 0; h < 24; h++) {
          const vals = hourMap.get(h) || [0];
          rawHours.push({ hour: `${h}h`, avg: vals.reduce((a, b) => a + b) / vals.length, pct: 0 });
        }
        const maxHour = Math.max(...rawHours.map(h => h.avg));
        this.hourStats = rawHours.map(h => ({ ...h, pct: (h.avg / maxHour) * 100 }));

        // Auto insights
        const peakDay = this.dayStats[this.peakDayIndex];
        const lowDay = this.dayStats[this.lowDayIndex];
        const peakHour = this.hourStats.reduce((a, b) => a.avg > b.avg ? a : b);
        const lowHour = this.hourStats.reduce((a, b) => a.avg < b.avg ? a : b);

        this.insights = [
          {
            title: `Pico: ${peakDay?.date}`,
            desc: `Día de mayor disponibilidad con ${this.fmt(peakDay?.avg)} tiendas promedio.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
            bg: '#f0fdf4'
          },
          {
            title: `Menor: ${lowDay?.date}`,
            desc: `Día de menor disponibilidad con ${this.fmt(lowDay?.avg)} tiendas promedio.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
            bg: '#eff6ff'
          },
          {
            title: `Hora pico: ${peakHour?.hour}`,
            desc: `Mayor actividad a las ${peakHour?.hour} con ${this.fmt(peakHour?.avg)} tiendas promedio.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#FF441A" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            bg: '#fff4f1'
          },
          {
            title: `Hora baja: ${lowHour?.hour}`,
            desc: `Menor actividad a las ${lowHour?.hour} con ${this.fmt(lowHour?.avg)} tiendas promedio.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
            bg: '#faf5ff'
          },
          {
            title: `Promedio global: ${this.fmt(avgGlobal)}`,
            desc: `Media de disponibilidad calculada sobre los 67,141 registros.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            bg: '#f0f9ff'
          },
          {
            title: `Cobertura: ${this.fmt(maxGlobal)}`,
            desc: `Máximo pico de tiendas visibles simultáneamente en el período.`,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
            bg: '#fffbeb'
          }
        ];

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Error cargando datos';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  fmt(n: number): string {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toFixed(0);
  }
}
