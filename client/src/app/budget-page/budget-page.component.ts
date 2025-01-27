import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { BankBalanceComponent } from "../bank-balance/bank-balance.component";
import { NgFor } from '@angular/common';
import { WateringCanComponent } from "../watering-can/watering-can.component";
import { AuthenticationService } from '../services/authentication.service';
import { currencyMap } from '../data-structures/currency-codes';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';

type BudgetCategory = {
  name: string,
  category_type: string,
  amount: number,
  spent: number,
}

type ROW_DATA_STRUCTURE = {
  name: string,
  category_type: string,
  amount: number
}

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [NavBarComponent, BankBalanceComponent, NgFor, WateringCanComponent, RouterLink, MatButtonModule],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.scss'
})
export class BudgetPageComponent {
  total!: number;
  currentUser: any;
  currencySymbol!: string;
  currentUrl: string;

  categories: BudgetCategory[] = [];

  constructor(private authService: AuthenticationService, private router: Router, private queryService: QueryService) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      let currency = this.currentUser.default_currency;
      this.currencySymbol = currencyMap[currency].symbol;
    });

    this.getCats();
  }

  receiveTotal(total: number) {
    this.total = total;
  }

  getCats() {
      this.getBudget().subscribe(budget => {
        const populateBudget = budget.map(async (row) => {
          const amountSpent = await firstValueFrom(this.getSpentAmount(row.name));
          const spent = Number(amountSpent) || 0;
    
          return {
            ...row,
            spent,
          };
        });
        Promise.all(populateBudget).then(budget => {
          this.categories = budget;
        });
      });
    }
  
    getBudget(): Observable<ROW_DATA_STRUCTURE[]> {
      return this.queryService.getBudget(this.currentUser.user_id).pipe(
        map(response => response),
        catchError(error => {
          console.error('Error retrieving budget', error);
          return of([]);
        })
      );
    }
  
    getSpentAmount(category: string): Observable<number> {
      return this.queryService.getSpentAmount(this.currentUser.user_id, category).pipe(
        map(response => response),
        catchError(error => {
          console.error(`Error retrieving the spent amount for category '${category}'`, error);
          return of(0);
        })
      );
    }
}
