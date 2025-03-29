import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = environment.apiUrl;

  private token!: string | null;
  private headers!: { Authorization: string };

  constructor(private http: HttpClient, private authService: AuthenticationService) {
    this.token = sessionStorage.getItem('token');
    this.headers = { Authorization: `Bearer ${this.token}` };
  }

  private handleError(error: any) {
    if (error.status === 403) {
      this.authService.logout();
      this.authService.displayExpiredTokenPopup();
    }
    
    return of(null);
  }

  getCategories(transaction_type: String): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${transaction_type}`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  logTransaction(transactionData: any, userID: String, dates: String[]): Observable<any> {
    const newStruct = { ...transactionData, dates };
    return this.http.post(`${this.apiUrl}/transactions/${userID}`, newStruct, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  setBudget(budgetData: { category: string; amount: string; category_type: string }[], userID: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/budget/${userID}`, budgetData, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getBudget(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/budget/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deleteBudgetItems(deleteCategories: { name: string, type: string }[], userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/budget/delete/${userID}`, deleteCategories, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  setSavingsGoal(savingsInfo: any, userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goal/${userID}`, savingsInfo, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  updateSavingsGoal(goalID: string, savingsInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goal/update/${goalID}`, savingsInfo, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getBalance(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getTotal(userID: string, type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/${userID}/${type}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getTotalGoalAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goals/total-goal/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getPastTransactions(type: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/past/${type}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getUpcomingTransactions(type: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/upcoming/${type}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transaction/${id}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getSavingsGoals(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goals/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  updateGoalsRanking(rankings: { goal_id: number, ranking: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goals/update`, rankings, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deleteSavingsGoal(id: number, userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goals/delete/${id}`, { userID }, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getSavingsGoal(goalID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goal/${goalID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deleteTransaction(id: number, repeatDelete: 'single' | 'all' | 'after' | null, date: string): Observable<any> {
    const payload = { repeatDelete, date };
    return this.http.post(`${this.apiUrl}/transaction/delete/${id}`, payload, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  updateTransaction(transactionData: any, transID: String, date: string, updateOption: 'single' | 'all' | 'after' | null): Observable<any> {
    const newStruct = { ...transactionData, date };
    return this.http.post(`${this.apiUrl}/transactions/update/${updateOption}/${transID}`, newStruct, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getMonthlyBudget(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/budget/total/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getMonthlySpend(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/spent/month/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getSpentAmount(userID: string, category: string, type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/spent/${userID}/${category}/${type}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getOutgoingsAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/outgoings/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getIncomeAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/total-income/${userID}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getWeeklyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/week/${transType}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getMonthlyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/month/${transType}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getYearlyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/year/${transType}`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getWeeklyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/week`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getMonthlyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/month`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getYearlyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/year`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getWeeklyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/week`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getMonthlyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/month`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getYearlyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/year`, { headers: this.headers }).pipe(
      catchError((error) => this.handleError(error))
    );
  }
}
