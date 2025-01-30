import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCategories(transaction_type: String): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${transaction_type}`);
  }

  logTransaction(transactionData: any, userID: String, dates: String[]): Observable<any> {
    const newStruct = { ...transactionData, dates };
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

  deleteBudgetItems(deleteCategories: { name: string, type: string }[], userID: string): Observable<any> {
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

  updateSavingsGoal(goalID: string, savingsInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goal/update/${goalID}`, savingsInfo).pipe(
      map(response => {
        return response;
      })
    )
  }

  getBalance(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/${userID}`);
  }

  getTotal(userID: string, type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/${userID}/${type}`);
  }

  getTotalGoalAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goals/total-goal/${userID}`);
  }

  getPastTransactions(type: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/past/${type}`);
  }

  getUpcomingTransactions(type: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/upcoming/${type}`);
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transaction/${id}`);
  }

  getSavingsGoals(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goals/${userID}`);
  }

  updateGoalsRanking(rankings: { goal_id: number, ranking: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goals/update`, rankings).pipe(
      map(response => {
        return response;
      })
    )
  }

  deleteSavingsGoal(id: number, userID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/savings-goals/delete/${id}`, { userID }).pipe(
      map(response => {
        return response;
      })
    )
  }

  getSavingsGoal(goalID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings-goal/${goalID}`);
  }

  deleteTransaction(id: number, repeatDelete: 'single' | 'all' | 'after' | null, date: string): Observable<any> {
    const payload = { repeatDelete, date };
    return this.http.post(`${this.apiUrl}/transaction/delete/${id}`, payload).pipe(
      map(response => {
        return response;
      })
    )
  }

  updateTransaction(transactionData: any, transID: String, date: string, updateOption: 'single' | 'all' | 'after' | null): Observable<any> {
    const newStruct = { ...transactionData, date };
    return this.http.post(`${this.apiUrl}/transactions/update/${updateOption}/${transID}`, newStruct).pipe(
      map(response => {
        return response;
      })
    );
  }

  getMonthlyBudget(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/budget/total/${userID}`);
  }

  getMonthlySpend(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/spent/month/${userID}`);
  }

  getSpentAmount(userID: string, category: string, type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/spent/${userID}/${category}/${type}` );
  }

  getOutgoingsAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/outgoings/${userID}`);
  }

  getIncomeAmount(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/total-income/${userID}`);
  }

  getWeeklyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/week/${transType}`);
  }

  getMonthlyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/month/${transType}`);
  }

  getYearlyCats(transType: string, userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/year/${transType}`);
  }

  getWeeklyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/week`);
  }

  getMonthlyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/month`);
  }

  getYearlyTimeSeries(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/timeseries/year`);
  }

  getWeeklyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/week`);
  }

  getMonthlyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/month`);
  }

  getYearlyExpenses(userID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${userID}/expenses/year`);
  }
}
