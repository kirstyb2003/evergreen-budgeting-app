import { Component, OnInit, SimpleChanges } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { BankBalanceComponent } from "../bank-balance/bank-balance.component";
import { TransactionTableComponent } from "../transaction-table/transaction-table.component";
import { currencyMap } from '../data-structures/currency-codes';
import { DisplaySavingsGoalsComponent } from "../display-savings-goals/display-savings-goals.component";
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-transaction-display-page',
    imports: [NavBarComponent, BankBalanceComponent, TransactionTableComponent, DisplaySavingsGoalsComponent, NgIf, MatButtonModule, RouterLink],
    templateUrl: './transaction-display-page.component.html',
    styleUrl: './transaction-display-page.component.scss'
})
export class TransactionDisplayPageComponent implements OnInit {
  currentUser!: any;
  currencySymbol!: string;

  transactionType: string | null = null;
  transactionTypeText: string = '';

  total!: number;

  currentUrl: string;

  constructor(private authService: AuthenticationService, private router: Router, private route: ActivatedRoute) {
    this.currentUrl = this.router.url;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      let currency = this.currentUser.default_currency;
      this.currencySymbol = currencyMap[currency].symbol;
    });

    this.route.paramMap.subscribe(params => {
      this.transactionType = params.get('type');

      if (this.transactionType === "expense") {
        this.transactionTypeText = "Expenses";
      } else {
        this.transactionTypeText = this.transactionType!.charAt(0).toUpperCase() + this.transactionType!.slice(1);
      }
    });
  }

  receiveTotal(total: number) {
    this.total = total;
  }

}
