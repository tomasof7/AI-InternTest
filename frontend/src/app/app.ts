import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ChatbotComponent],
  template: `
    <div class="app-wrapper">
      <header class="navbar">
        <div class="navbar-content">
          <div class="navbar-brand">
            <span class="logo-icon">📊</span>
            <h1>Rappi Availability</h1>
          </div>
          <p class="navbar-subtitle">Plataforma de Inteligencia en Tiempo Real</p>
        </div>
        <div class="navbar-accent"></div>
      </header>

      <main class="main-content">
        <div class="container-fluid">
          <section class="dashboard-container">
            <app-dashboard></app-dashboard>
          </section>
          <section class="chatbot-section">
            <h2 class="section-title">💬 Asistente de Inteligencia Artificial</h2>
            <div class="chatbot-container">
              <app-chatbot></app-chatbot>
            </div>
          </section>
        </div>
      </main>

      <footer class="app-footer">
        <div class="footer-content">
          <p>🚀 Impulsado por FastAPI + Groq AI | Angular 18</p>
          <p class="data-range">📅 Período de datos: 01-11 de febrero, 2026</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      color: #0f172a;
    }

    .navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 24px 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-content {
      max-width: 1600px;
      margin: 0 auto;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 32px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .navbar-brand h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #FF441A;
    }

    .navbar-subtitle {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .navbar-accent {
      height: 0px;
      background: transparent;
      margin-top: 12px;
      border-radius: 2px;
    }

    .main-content {
      flex: 1;
      padding: 32px 16px;
      background: #f8fafc;
    }

    .container-fluid {
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-container {
      margin-bottom: 32px;
    }

    .chatbot-section {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 1px solid #e2e8f0;
    }

    .section-title {
      color: #0f172a;
      margin: 0 auto 20px auto;
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      max-width: 900px;
    }

    .chatbot-container {
      display: flex;
      justify-content: center;
      max-width: 900px;
      margin: 0 auto;
    }

    .app-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 20px 32px;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1600px;
      margin: 0 auto;
      text-align: center;
      color: #94a3b8;
      font-size: 13px;
    }

    .footer-content p {
      margin: 4px 0;
    }

    .data-range {
      color: #FF441A;
      font-weight: 600;
    }

    @media (max-width: 1200px) {
      .navbar-brand h1 {
        font-size: 22px;
      }

      .navbar {
        padding: 16px 20px;
      }

      .chatbot-container {
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px 12px;
      }

      .navbar-brand {
        gap: 8px;
      }

      .logo-icon {
        font-size: 24px;
      }

      .navbar-brand h1 {
        font-size: 18px;
      }
    }
  `]
})
export class App {
  title = 'Rappi Availability Dashboard';
}
