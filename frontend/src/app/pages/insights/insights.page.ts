import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="insights-shell fade-in">

      <!-- Left panel: context -->
      <aside class="context-panel">
        <div class="context-header">
          <h3>Contexto de datos</h3>
        </div>
        <div class="context-body">
          <div class="context-item">
            <span class="context-key">Registros</span>
            <span class="context-val">67,141</span>
          </div>
          <div class="context-item">
            <span class="context-key">Período</span>
            <span class="context-val">01–11 Feb 2026</span>
          </div>
          <div class="context-item">
            <span class="context-key">Granularidad</span>
            <span class="context-val">10 segundos</span>
          </div>
          <div class="context-item">
            <span class="context-key">Modelo</span>
            <span class="context-val">llama-3.1-8b</span>
          </div>
          <div class="context-item">
            <span class="context-key">Modo</span>
            <span class="context-val rag-badge">RAG</span>
          </div>
        </div>

        <div class="suggestions-title">Preguntas sugeridas</div>
        <div class="suggestions">
          <button
            *ngFor="let q of suggestions"
            class="suggestion-btn"
            (click)="useQuestion(q)"
            [disabled]="loading"
          >{{ q }}</button>
        </div>
      </aside>

      <!-- Main chat -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-title">
            <div class="ai-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div>
              <h2>Asistente de Disponibilidad</h2>
              <p>Análisis inteligente con RAG + Groq AI</p>
            </div>
          </div>
          <span class="badge badge-green">● Activo</span>
        </div>

        <div class="messages-area" #chatMessages>
          <div
            *ngFor="let msg of messages; let i = index"
            class="message-row"
            [class.user-row]="msg.role === 'user'"
            [class.ai-row]="msg.role === 'assistant'"
          >
            <div class="msg-avatar" *ngIf="msg.role === 'assistant'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div class="bubble" [class.user-bubble]="msg.role === 'user'" [class.ai-bubble]="msg.role === 'assistant'">
              <p>{{ msg.content }}</p>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <div class="msg-avatar user-avatar" *ngIf="msg.role === 'user'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>

          <!-- Typing indicator -->
          <div *ngIf="loading" class="message-row ai-row">
            <div class="msg-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div class="bubble ai-bubble typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="error" class="chat-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ error }}
        </div>

        <!-- Input bar -->
        <div class="input-bar">
          <div class="input-wrap">
            <textarea
              [(ngModel)]="userInput"
              (keydown)="onKeydown($event)"
              placeholder="Pregunta sobre las tiendas Rappi... (Enter para enviar)"
              rows="1"
              [disabled]="loading"
              #inputRef
            ></textarea>
            <button class="send-btn" (click)="sendMessage()" [disabled]="loading || !userInput.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p class="input-hint">Shift+Enter para nueva línea · Groq llama-3.1-8b-instant</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .insights-shell {
      display: flex;
      height: calc(100vh - var(--navbar-height));
      overflow: hidden;
      background: var(--bg);
    }

    /* Context panel */
    .context-panel {
      width: 240px;
      min-width: 240px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .context-header {
      padding: 20px 18px 12px;
      border-bottom: 1px solid var(--border);
    }

    .context-header h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--text-muted);
    }

    .context-body {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
    }

    .context-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
    }

    .context-key {
      font-size: 12px;
      color: var(--text-muted);
    }

    .context-val {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .rag-badge {
      background: var(--brand-light);
      color: var(--brand);
      padding: 1px 7px;
      border-radius: 99px;
      font-size: 10.5px;
    }

    .suggestions-title {
      padding: 14px 18px 8px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--text-muted);
    }

    .suggestions {
      padding: 0 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .suggestion-btn {
      text-align: left;
      padding: 9px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
      transition: all var(--transition);
      cursor: pointer;
    }

    .suggestion-btn:hover:not(:disabled) {
      background: var(--brand-light);
      border-color: var(--brand);
      color: var(--brand);
    }

    .suggestion-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Chat main */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ai-avatar {
      width: 38px;
      height: 38px;
      background: var(--brand);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .chat-title h2 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .chat-title p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    /* Messages */
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg);
    }

    .message-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-row {
      flex-direction: row-reverse;
    }

    .msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--brand-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
      flex-shrink: 0;
    }

    .user-avatar {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }

    .bubble {
      max-width: 68%;
      padding: 12px 16px;
      border-radius: 16px;
      position: relative;
    }

    .ai-bubble {
      background: var(--surface);
      border: 1px solid var(--border);
      border-bottom-left-radius: 4px;
    }

    .user-bubble {
      background: var(--brand);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bubble p {
      font-size: 13.5px;
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
    }

    .user-bubble p { color: white; }
    .ai-bubble p { color: var(--text-primary); }

    .msg-time {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 5px;
      text-align: right;
    }

    .user-bubble .msg-time { color: rgba(255,255,255,0.65); }

    /* Typing dots */
    .typing-bubble {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 14px 18px;
    }

    .dot {
      width: 7px;
      height: 7px;
      background: var(--text-muted);
      border-radius: 50%;
      animation: typing-bounce 1.2s ease-in-out infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    /* Error */
    .chat-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: #fef2f2;
      border-top: 1px solid #fecaca;
      color: #dc2626;
      font-size: 12.5px;
      font-weight: 500;
    }

    /* Input bar */
    .input-bar {
      padding: 14px 20px 16px;
      background: var(--surface);
      border-top: 1px solid var(--border);
    }

    .input-wrap {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 10px 10px 10px 16px;
      transition: all var(--transition);
    }

    .input-wrap:focus-within {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(255,68,26,0.08);
      background: var(--surface);
    }

    textarea {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 13.5px;
      color: var(--text-primary);
      resize: none;
      line-height: 1.5;
      max-height: 120px;
      overflow-y: auto;
    }

    textarea::placeholder { color: var(--text-muted); }
    textarea:disabled { opacity: 0.6; }

    .send-btn {
      width: 34px;
      height: 34px;
      background: var(--brand);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition);
    }

    .send-btn:hover:not(:disabled) {
      background: var(--brand-hover);
      transform: translateY(-1px);
    }

    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .input-hint {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 8px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .context-panel { display: none; }
    }
  `]
})
export class InsightsPage implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  loading = false;
  error: string | null = null;

  suggestions = [
    '¿Cuál es el patrón de disponibilidad general?',
    '¿A qué hora hay mayor disponibilidad?',
    '¿Hay diferencia entre semana y fin de semana?',
    '¿Cuál fue el día con menor disponibilidad?',
    '¿Cuál es el promedio de tiendas visibles?'
  ];

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.messages.push({
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de disponibilidad Rappi. Analizo en tiempo real los 67,141 registros del período 01–11 de Febrero 2026. ¿Qué quieres saber?',
      time: this.getTime()
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      const el = this.chatMessagesRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  useQuestion(q: string) {
    this.userInput = q;
    this.sendMessage();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.loading) return;

    const question = this.userInput.trim();
    this.messages.push({ role: 'user', content: question, time: this.getTime() });
    this.userInput = '';
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.chatService.sendMessage(question).subscribe({
      next: (response) => {
        this.messages.push({ role: 'assistant', content: response.answer, time: this.getTime() });
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Error al procesar la pregunta';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }
}
