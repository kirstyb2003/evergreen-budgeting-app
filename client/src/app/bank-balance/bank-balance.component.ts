import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { currencyMap } from '../data-structures/currency-codes';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { catchError, map, Observable, of } from 'rxjs';
import { CurrencyPipe, NgIf } from '@angular/common';

let cellHeaderMap = new Map<string, string>([
  ["expense", "Total Amount Spent"],
  ["income", "Total Income"],
  ["savings", "Total Saved"]
]);

@Component({
  selector: 'app-bank-balance',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './bank-balance.component.html',
  styleUrl: './bank-balance.component.scss'
})
export class BankBalanceComponent implements OnInit {
  @Input({ required: true }) pageType!: string | null;
  @Output() calculatexTotal = new EventEmitter<number>();

  balance: number = 0.00;
  total: number = 0.00;

  currentUser: any;

  cellHeader: string = "Total";
  currSymbol!: string;

  constructor(private authService: AuthenticationService, private router: Router, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      let currency = this.currentUser.default_currency;
      this.currSymbol = currencyMap[currency].symbol;
    });

    if (!this.pageType) {
      this.pageType = "income";
    }

    if (cellHeaderMap.has(this.pageType)) {
      this.cellHeader = cellHeaderMap.get(this.pageType)!;
    }

    this.getBankBalance().subscribe(balance => {
      this.balance = balance;
    });

    this.getTotal().subscribe(total => {
      this.total = total;
      this.calculatexTotal.emit(total);
    });

  }

  getBankBalance(): Observable<number> {
    return this.queryService.getBalance(this.currentUser.user_id).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving bank balance', error);
        return of(0);
      })
    );
  }

  getTotal(): Observable<number> {
    return this.queryService.getTotal(this.currentUser.user_id, this.pageType!).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total ${this.pageType}s`, error);
        return of(0);
      })
    );
  }
}
