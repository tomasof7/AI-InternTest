import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot">
      <div class="chat-header">
        <h2>💬 Asistente de Disponibilidad</h2>
        <p class="subtitle">Haz preguntas sobre disponibilidad de tiendas</p>
      </div>

      <div class="chat-messages" #chatMessages>
        <div *ngFor="let msg of messages" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'" class="message">
          <div class="message-content">
            <p>{{ msg.content }}</p>
          </div>
        </div>

        <div *ngIf="loading" class="message assistant">
          <div class="message-content">
            <p>🤔 Pensando...</p>
          </div>
        </div>
      </div>

      <div class="chat-input-section">
        <textarea
          [(ngModel)]="userInput"
          (keydown.enter)="sendMessage()"
          placeholder="Pregunta sobre disponibilidad... (Presiona Enter para enviar)"
          rows="2"
        ></textarea>
        <button (click)="sendMessage()" [disabled]="loading || !userInput.trim()">
          📤 Enviar
        </button>
      </div>

      <div class="error" *ngIf="error">
        <p>❌ {{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .chatbot {
      display: flex;
      flex-direction: column;
      height: 650px;
      max-height: 650px;
      background: #ffffff;
      backdrop-filter: none;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .chat-header {
      background: #FF441A;
      color: white;
      padding: 20px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 68, 26, 0.1);
    }

    .chat-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .chat-header .subtitle {
      margin: 6px 0 0 0;
      font-size: 12px;
      opacity: 0.85;
      font-weight: 500;
    }

    .chat-messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #fafbfc;
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 68, 26, 0.3);
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 68, 26, 0.5);
    }

    .message {
      display: flex;
      margin-bottom: 8px;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message.assistant {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 12px;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .message.user .message-content {
      background: #FF441A;
      color: white;
      border-bottom-right-radius: 2px;
      box-shadow: 0 2px 8px rgba(255, 68, 26, 0.15);
    }

    .message.assistant .message-content {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #0f172a;
      border-bottom-left-radius: 2px;
    }

    .message p {
      margin: 0;
      line-height: 1.5;
      font-size: 14px;
    }

    .chat-input-section {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      background: #ffffff;
    }

    textarea {
      flex: 1;
      padding: 11px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      resize: none;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    textarea::placeholder {
      color: #94a3b8;
    }

    textarea:focus {
      outline: none;
      border-color: #FF441A;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(255, 68, 26, 0.1);
    }

    button {
      padding: 11px 20px;
      background: #FF441A;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(255, 68, 26, 0.2);
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 68, 26, 0.3);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      text-align: center;
      border-radius: 8px;
      margin: 0 20px;
    }

    .error p {
      margin: 0;
      font-size: 13px;
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  loading = false;
  error: string | null = null;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      if (this.chatMessagesRef && this.chatMessagesRef.nativeElement) {
        const element = this.chatMessagesRef.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngOnInit() {
    // Welcome message
    this.messages.push({
      role: 'assistant',
      content: '👋 ¡Hola! Soy tu asistente de disponibilidad de Rappi. Pregúntame sobre tendencias, anomalías o cualquier información que necesites sobre las tiendas.'
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    const question = this.userInput.trim();

    this.messages.push({
      role: 'user',
      content: question
    });

    this.userInput = '';  // Limpiar el input
    this.loading = true;
    this.error = null;

    // Forzar detección de cambios inmediatamente
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // Send to chatbot
    this.chatService.sendMessage(question).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.answer
        });
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Error sending message';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        console.error('Error:', err);
      }
    });
  }
}
