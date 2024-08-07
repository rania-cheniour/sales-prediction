import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable,timer } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { Chart } from 'chart.js';
import { switchMap } from 'rxjs/operators';
export interface DataItem {
  Numero: string;
  'Code Article': string;
  Qte: number;
  PUHT: number;
  TVA: number;
  'Mnt HT': number;
  'Qte Piece': number;
  PUTTC: number;
  "Prix D'achat HT": number;
  'Mnt TTC': number;
  'Marge HT': number;
  'Code Client': string;
  Client: string;
  Marque: string;
  Date: string;
  'Designation Article': string;
  Exercice: string;
  'Code Station': string;
  Station: string;
  'Code Marque': string;
  'Code Famille': string;
  Famille: string;
}
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  chart: any;
  private baseUrl = 'http://localhost:5000'; // Your Flask backend URL
  public apiUrl = 'http://localhost:5000/getData';
  private pollingInterval = 5000;
  constructor(private http: HttpClient,private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email: email, password: password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, { email: email, password: password });
  }
  isLoggedIn(): boolean {
    // Check if the token exists in local storage
    return !!localStorage.getItem('access_token')
  }

  logout() {
    // Handle success message (optional)

        localStorage.removeItem('token')
        localStorage.clear()
        // Remove token after backend response
      
  }
  //getData(): Observable<any> {
  //  return this.http.get<any[]>(`${this.baseUrl}/getData`);
  //
  getData(): Observable<any[]> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map(response => {
        const parsedData = Papa.parse(response, { header: true }).data;
        return parsedData;
      }),
      catchError(error => {
        console.error('Error fetching data', error);
        return of([]);
      })
    );
  }

  getGroupedData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/grouped_data`).pipe(
      catchError(error => {
        console.error('Error fetching grouped data', error);
        return of([]); // Return an empty array on error
      })
    );
  }


  // getQuantityByMonth(famille: string, year: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/get_quantity_by_month`, {
  //       params: new HttpParams().set('famille', famille).set('year', year)
  //   });
//}
getFamilles(): Observable<string[]> {
  return timer(0, this.pollingInterval).pipe(
    switchMap(() => this.http.get<string[]>(`${this.baseUrl}/familles`))
  );
}


// getQuantityByMonth(year: number, famille: string): Observable<any> {
//   let params = new HttpParams().set('year', year.toString());
//   if (famille) {
//     params = params.set('famille', famille);
//   }
//   return this.http.get('/get_quantity_by_month', { params });
// }

getQuantityByMonth(famille: string, year: number, month: number): void {
  this.http.get<any[]>(`http://127.0.0.1:5000/get_quantity_by_month`, {
    params: {
      famille: famille,
      year: year.toString(), // Ensure values are strings
      month: month.toString()
    }
  }).subscribe(data => {
    const labels = data.map(item => `Month ${item.Month}`);
    const quantities = data.map(item => item.Qte);

    if (this.chart) {
      this.chart.destroy(); // Destroy the previous chart instance if it exists
    }

    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `Quantity for ${famille} in ${year} in ${month}`,
            data: quantities,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
}
}
