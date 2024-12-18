import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { json } from 'express';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(transaction_type: String): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${transaction_type}`);
  }

  logTransaction(transactionData: any, userID: String, dates: String[]): Observable<any> {
    const newStruct = {...transactionData, dates};
    return this.http.post(`${this.apiUrl}/transactions/${userID}`, newStruct).pipe(
      map(response => {
        return response;
      })
    );
  }

  setBudget(budgetData: { category: string; amount: string; category_type: string }[], userID: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/budget/${userID}`, budgetData).pipe(
      map(response => {
        return response;
      })
    );
  }

  getBudget(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/budget/${userID}`);
  }

  deleteBudgetItems(deleteCategories: {name: string, type: string}[], userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/budget/delete/${userID}`, deleteCategories).pipe(
      map(response => {
        return response;
      })
    );
  }

  setSavingsGoal(savingsInfo: any, userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goal/${userID}`, savingsInfo).pipe(
      map(response => {
        return response;
      })
    )
  }
}
