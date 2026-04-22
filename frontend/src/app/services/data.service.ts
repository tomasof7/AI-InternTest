import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getData(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();

    if (fromDate) params = params.set('from_date', fromDate);
    if (toDate) params = params.set('to_date', toDate);

    const url = `${this.apiUrl}/data`;

    return this.http.get<any>(url, { params }).pipe(
      tap(data => console.log('Data loaded:', data))
    );
  }
}
