import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Sobre el Proyecto</h1>
        <p>Plataforma de inteligencia de datos para Rappi · Prueba Técnica 2026</p>
      </div>

      <!-- Hero -->
      <div class="hero-card card">
        <div class="hero-left">
          <div class="hero-logo">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FF441A"/>
              <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h2>Rappi Store Availability Dashboard</h2>
            <p>Plataforma web inteligente que visualiza la disponibilidad de tiendas Rappi con análisis conversacional por IA.</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat" *ngFor="let s of heroStats">
            <span class="hero-stat-val">{{ s.val }}</span>
            <span class="hero-stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <div class="about-grid">

        <!-- Problem -->
        <div class="card about-card">
          <div class="about-icon" style="background:#fff4f1;color:#FF441A">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>El Problema</h3>
          <p>Los equipos de operaciones de Rappi necesitan visualizar patrones de disponibilidad de tiendas a lo largo del tiempo para detectar anomalías, picos de demanda y ventanas de baja actividad, sin necesidad de escribir consultas SQL.</p>
        </div>

        <!-- Solution -->
        <div class="card about-card">
          <div class="about-icon" style="background:#f0fdf4;color:#16a34a">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>La Solución</h3>
          <p>Dashboard interactivo con 4 tipos de gráficos + chatbot IA con RAG que permite hacer preguntas en lenguaje natural sobre los 67,141 registros históricos, obteniendo respuestas basadas en datos reales sin alucinaciones.</p>
        </div>

        <!-- Impact -->
        <div class="card about-card">
          <div class="about-icon" style="background:#eff6ff;color:#2563eb">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <h3>Impacto</h3>
          <p>Reducción del tiempo de análisis de horas a segundos. Cualquier miembro del equipo puede obtener insights sin conocimiento técnico de SQL o Python, democratizando el acceso a la inteligencia de datos.</p>
        </div>

      </div>

      <!-- Features -->
      <section class="section">
        <div class="section-title-row">
          <h2>Características Técnicas</h2>
        </div>
        <div class="features-grid">
          <div class="feature-item" *ngFor="let f of features">
            <div class="feature-dot" [style.background]="f.color"></div>
            <div>
              <h4>{{ f.title }}</h4>
              <p>{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Data section -->
      <section class="section">
        <div class="card data-card">
          <div class="data-header">
            <h3>Dataset</h3>
            <span class="badge badge-orange">201 archivos CSV</span>
          </div>
          <div class="data-pipeline">
            <div class="pipeline-step" *ngFor="let step of pipeline; let i = index; let last = last">
              <div class="pipeline-icon">{{ i + 1 }}</div>
              <div class="pipeline-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.desc }}</p>
              </div>
              <svg *ngIf="!last" class="pipeline-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .hero-card {
      padding: 28px 32px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .hero-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;
    }

    .hero-logo {
      flex-shrink: 0;
    }

    .hero-left h2 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .hero-left p {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 500px;
    }

    .hero-stats {
      display: flex;
      gap: 28px;
      flex-shrink: 0;
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .hero-stat-val {
      font-size: 22px;
      font-weight: 700;
      color: var(--brand);
      letter-spacing: -0.5px;
    }

    .hero-stat-label {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      font-weight: 500;
    }

    .about-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .about-card {
      padding: 22px;
    }

    .about-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }

    .about-card h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .about-card p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .section { margin-bottom: 32px; }

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

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .feature-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 14px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }

    .feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .feature-item h4 {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .feature-item p {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Data pipeline */
    .data-card { padding: 24px 28px; }

    .data-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .data-header h3 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .data-pipeline {
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .pipeline-step {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .pipeline-icon {
      width: 28px;
      height: 28px;
      background: var(--brand);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .pipeline-content {
      padding: 10px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      min-width: 140px;
    }

    .pipeline-content h4 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .pipeline-content p {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .pipeline-arrow {
      color: var(--text-muted);
      margin: 0 6px;
      flex-shrink: 0;
    }

    @media (max-width: 900px) {
      .about-grid { grid-template-columns: 1fr; }
      .hero-card { flex-direction: column; }
      .features-grid { grid-template-columns: 1fr; }
      .hero-stats { gap: 16px; }
    }
  `]
})
export class AboutPage {
  heroStats = [
    { val: '67K+', label: 'Registros' },
    { val: '11', label: 'Días' },
    { val: '4', label: 'Gráficos' },
    { val: 'RAG', label: 'IA Mode' }
  ];

  features = [
    { title: '4 Gráficos Interactivos', desc: 'Series de tiempo, promedio diario, patrón horario y rango min/max con Chart.js', color: '#FF441A' },
    { title: 'RAG Chatbot', desc: 'Retrieval-Augmented Generation: busca en SQLite antes de enviar al LLM', color: '#6366f1' },
    { title: 'Performance Optimizado', desc: 'Sampling de 67K→500 puntos para gráficos fluidos, índices SQLite para queries < 10ms', color: '#16a34a' },
    { title: 'Sin alucinaciones', desc: 'El LLM solo responde con datos reales extraídos de la base de datos', color: '#0891b2' },
    { title: 'API REST documentada', desc: 'FastAPI con auto-docs en /docs, modelos Pydantic para validación', color: '#d97706' },
    { title: 'Arquitectura escalable', desc: 'Standalone components Angular 18, lazy loading, servicios inyectables', color: '#7c3aed' }
  ];

  pipeline = [
    { title: '201 CSVs (Wide)', desc: 'Columnas = timestamps, filas = tiendas' },
    { title: 'Transformación', desc: 'Wide → Long format con Pandas' },
    { title: 'Parse timestamps', desc: 'Verbose → ISO 8601 con regex' },
    { title: 'Consolidación', desc: '67,141 rows en SQLite con 3 índices' },
    { title: 'API FastAPI', desc: 'Servida a Angular via REST' }
  ];
}
