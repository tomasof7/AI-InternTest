import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Arquitectura del Sistema</h1>
        <p>Stack técnico completo · Frontend, Backend, Base de Datos, IA</p>
      </div>

      <!-- Flow diagram -->
      <section class="section">
        <div class="flow-card card">
          <div class="flow-title">Flujo de Datos End-to-End</div>
          <div class="flow-diagram">
            <div class="flow-node node-user">
              <div class="node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span class="node-label">Usuario</span>
            </div>
            <div class="flow-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              <span>HTTP</span>
            </div>
            <div class="flow-node node-frontend">
              <div class="node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <span class="node-label">Angular 18</span>
              <span class="node-sub">Puerto 4200</span>
            </div>
            <div class="flow-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              <span>REST API</span>
            </div>
            <div class="flow-node node-backend">
              <div class="node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <span class="node-label">FastAPI</span>
              <span class="node-sub">Puerto 8000</span>
            </div>
            <div class="flow-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              <span>SQL</span>
            </div>
            <div class="flow-node node-db">
              <div class="node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <span class="node-label">SQLite</span>
              <span class="node-sub">67,141 rows</span>
            </div>
          </div>

          <!-- RAG flow -->
          <div class="rag-flow">
            <div class="rag-title">Flujo RAG (Chatbot)</div>
            <div class="rag-steps">
              <div class="rag-step" *ngFor="let step of ragSteps; let i = index">
                <div class="rag-num">{{ i + 1 }}</div>
                <div class="rag-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.desc }}</p>
                </div>
                <svg *ngIf="i < ragSteps.length - 1" class="rag-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stack cards -->
      <section class="section">
        <div class="section-title-row">
          <h2>Stack Tecnológico</h2>
        </div>
        <div class="stack-grid">
          <div class="stack-card card" *ngFor="let layer of stackLayers">
            <div class="stack-layer-badge" [style.background]="layer.color + '20'" [style.color]="layer.color">
              {{ layer.layer }}
            </div>
            <div class="stack-items">
              <div class="stack-item" *ngFor="let item of layer.items">
                <div class="stack-item-name">{{ item.name }}</div>
                <div class="stack-item-version">{{ item.version }}</div>
                <div class="stack-item-desc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Endpoints -->
      <section class="section">
        <div class="section-title-row">
          <h2>Endpoints API</h2>
          <span class="badge badge-green">FastAPI</span>
        </div>
        <div class="endpoints-card card">
          <div class="endpoint-row" *ngFor="let ep of endpoints; let last = last" [class.last]="last">
            <span class="ep-method" [class.get]="ep.method === 'GET'" [class.post]="ep.method === 'POST'">
              {{ ep.method }}
            </span>
            <code class="ep-path">{{ ep.path }}</code>
            <span class="ep-desc">{{ ep.desc }}</span>
            <span class="ep-response">{{ ep.response }}</span>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
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

    /* Flow */
    .flow-card { padding: 28px 32px; }

    .flow-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 24px;
    }

    .flow-diagram {
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .flow-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      min-width: 110px;
      flex-shrink: 0;
    }

    .node-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .node-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .node-sub {
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .node-user .node-icon { background: #f0f9ff; color: #0891b2; }
    .node-frontend .node-icon { background: #fef3c7; color: #d97706; }
    .node-backend .node-icon { background: var(--brand-light); color: var(--brand); }
    .node-db .node-icon { background: #f0fdf4; color: #16a34a; }

    .flow-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 0 10px;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .flow-arrow span {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-muted);
    }

    /* RAG flow */
    .rag-flow {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .rag-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 16px;
    }

    .rag-steps {
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
    }

    .rag-step {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .rag-num {
      width: 26px;
      height: 26px;
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

    .rag-content {
      padding: 10px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      min-width: 160px;
    }

    .rag-content h4 {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .rag-content p {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .rag-arrow {
      color: var(--text-muted);
      margin: 0 6px;
      flex-shrink: 0;
    }

    /* Stack */
    .stack-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stack-card { padding: 20px; }

    .stack-layer-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }

    .stack-items { display: flex; flex-direction: column; gap: 12px; }

    .stack-item { padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .stack-item:last-child { border-bottom: none; padding-bottom: 0; }

    .stack-item-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .stack-item-version {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1px 6px;
      color: var(--text-muted);
      margin: 3px 0;
    }

    .stack-item-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Endpoints */
    .endpoints-card { padding: 0; overflow: hidden; }

    .endpoint-row {
      display: grid;
      grid-template-columns: 60px 180px 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition);
    }

    .endpoint-row:hover { background: var(--surface-2); }
    .endpoint-row.last { border-bottom: none; }

    .ep-method {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      text-align: center;
    }

    .ep-method.get { background: #f0fdf4; color: #16a34a; }
    .ep-method.post { background: #eff6ff; color: #2563eb; }

    code.ep-path {
      font-family: 'Menlo', 'Monaco', monospace;
      font-size: 12.5px;
      color: var(--brand);
      background: var(--brand-light);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .ep-desc {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .ep-response {
      font-size: 11.5px;
      color: var(--text-muted);
      text-align: right;
    }

    @media (max-width: 1000px) {
      .stack-grid { grid-template-columns: 1fr 1fr; }
      .flow-diagram { flex-wrap: wrap; gap: 12px; }
      .rag-steps { flex-wrap: wrap; gap: 8px; }
      .endpoint-row { grid-template-columns: 60px 1fr; }
      .ep-response { display: none; }
    }

    @media (max-width: 640px) {
      .stack-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ArchitecturePage {
  ragSteps = [
    { title: 'Pregunta del usuario', desc: 'Input en lenguaje natural' },
    { title: 'Análisis de keywords', desc: 'Detecta "hora", "día", "pico"…' },
    { title: 'Query a SQLite', desc: 'GROUP BY hour/date según contexto' },
    { title: 'Construcción de prompt', desc: 'Datos reales + pregunta' },
    { title: 'Groq LLM', desc: 'llama-3.1-8b-instant genera respuesta' },
    { title: 'Respuesta al usuario', desc: 'Basada en datos reales' }
  ];

  stackLayers = [
    {
      layer: 'Frontend',
      color: '#d97706',
      items: [
        { name: 'Angular', version: '18', desc: 'Standalone components, routing, OnPush change detection' },
        { name: 'TypeScript', version: '5.9', desc: 'Tipado estático, interfaces, decoradores' },
        { name: 'Chart.js', version: '4.5', desc: 'Gráficos interactivos con tooltips y sampling' }
      ]
    },
    {
      layer: 'Backend',
      color: '#FF441A',
      items: [
        { name: 'FastAPI', version: '0.104+', desc: 'REST API async, auto-docs, CORS middleware' },
        { name: 'Python', version: '3.10+', desc: 'Pandas para procesamiento, python-dotenv para .env' },
        { name: 'Groq SDK', version: '0.4+', desc: 'LLM integration con llama-3.1-8b-instant' }
      ]
    },
    {
      layer: 'Datos',
      color: '#16a34a',
      items: [
        { name: 'SQLite', version: 'Built-in', desc: '67,141 registros, 3 índices, queries < 10ms' },
        { name: 'Pandas', version: '2.0+', desc: 'Transformación wide→long de 201 CSVs' },
        { name: 'Pydantic', version: '2.x', desc: 'Validación de modelos de datos para API' }
      ]
    }
  ];

  endpoints = [
    { method: 'GET', path: '/api/health', desc: 'Health check del servidor', response: '{ status: "ok" }' },
    { method: 'GET', path: '/api/data', desc: 'Retorna 67,141 puntos + KPIs agregados', response: 'DataResponse' },
    { method: 'POST', path: '/api/chat', desc: 'Procesa pregunta con RAG y Groq LLM', response: 'ChatResponse' }
  ];
}
