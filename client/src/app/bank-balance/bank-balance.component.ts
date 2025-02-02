import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { currencyMap } from '../data-structures/currency-codes';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { catchError, map, Observable, of } from 'rxjs';
import { CurrencyPipe, NgStyle } from '@angular/common';

let cellHeaderMap = new Map<string, string>([
  ["expense", "Total Spent (All Time)"],
  ["income", "Total Income (All Time)"],
  ["savings", "Total Saved (All Time)"],
  ["budget", "Net Monthly Spending"]
]);

@Component({
  selector: 'app-bank-balance',
  imports: [CurrencyPipe, NgStyle],
  templateUrl: './bank-balance.component.html',
  styleUrl: './bank-balance.component.scss'
})
export class BankBalanceComponent implements OnInit, OnChanges {
  @Input({ required: true }) pageType!: string | null;
  @Output() calculateTotal = new EventEmitter<number>();

  balance: number = 0.00;
  total: number = 0.00;

  user_id!: string;
  currentUser: any;

  cellHeader: string = "Total";
  balanceHeader: string = "Bank Balance";
  currSymbol!: string;

  constructor(private authService: AuthenticationService, private router: Router, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.setUpUser();
    this.setUpComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageType = changes['pageType'].currentValue;
    
    this.setUpUser();

    this.setUpComponent();
  }

  setUpUser() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      this.user_id = this.currentUser.user_id;
      let currency = this.currentUser.default_currency;
      this.currSymbol = currencyMap[currency].symbol;
    });
  }

  setUpComponent() {
    if (!this.pageType) {
      this.pageType = "income";
    }

    if (this.pageType === 'budget') {
      this.balanceHeader = "Total Monthly Budget";
    }

    if (cellHeaderMap.has(this.pageType)) {
      this.cellHeader = cellHeaderMap.get(this.pageType)!;
    }

    if (this.pageType === "budget") {
      this.getMonthlyBudget().subscribe(budget => {
        this.balance = budget;
      });

      this.getMonthlySpend().subscribe(total => {
        this.total = total;
        this.calculateTotal.emit(total);
      });
    } else {
      this.getBankBalance().subscribe(balance => {
        this.balance = balance;
      });

      this.getTotal().subscribe(total => {
        this.total = total;
        this.calculateTotal.emit(total);
      });
    }
  }

  getBankBalance(): Observable<number> {
    return this.queryService.getBalance(this.user_id).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving bank balance', error);
        return of(0);
      })
    );
  }

  getTotal(): Observable<number> {
    return this.queryService.getTotal(this.user_id, this.pageType!).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total ${this.pageType}s`, error);
        return of(0);
      })
    );
  }

  getMonthlyBudget(): Observable<number> {
    return this.queryService.getMonthlyBudget(this.user_id).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving monthly budget total', error);
        return of(0);
      })
    );
  }

  getMonthlySpend(): Observable<number> {
    return this.queryService.getMonthlySpend(this.user_id).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving bank balance', error);
        return of(0);
      })
    );
  }

  getStyle(): { [key: string]: string | number } {
    if (this.pageType === 'budget' && this.total > this.balance) {
      return { color: 'red', 'font-weight': 'bold' };
    }
    return { color: 'black', 'font-weight': 400 };
  }

}
