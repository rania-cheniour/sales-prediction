import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Papa from 'papaparse';
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
  private baseUrl = 'http://localhost:5000'; // Your Flask backend URL
  public apiUrl = 'http://localhost:5000/getData';
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


  getQuantityByMonth(famille: string, year: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get_quantity_by_month`, {
        params: new HttpParams().set('famille', famille).set('year', year)
    });
}
getFamilles(): Observable<string[]> {
  return this.http.get<string[]>(`${this.baseUrl}/get_familles`);
}
}
