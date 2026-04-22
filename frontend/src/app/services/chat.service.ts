import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  sendMessage(question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, {
      question: question
    });
  }
}
