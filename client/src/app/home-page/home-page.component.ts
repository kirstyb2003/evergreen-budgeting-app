import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { TransactionTableComponent } from "../transaction-table/transaction-table.component";
import { currencyMap } from '../data-structures/currency-codes';
import { BudgetTableComponent } from "../budget-table/budget-table.component";
import { NetIncomeTableComponent } from "../net-income-table/net-income-table.component";
import { SavingsAreaComponent } from "../savings-area/savings-area.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NavBarComponent, TransactionTableComponent, BudgetTableComponent, NetIncomeTableComponent, SavingsAreaComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  currentUser!: any;
  currentUrl!: string;

  currencySymbol!: string;

  constructor(private authService: AuthenticationService, private router: Router) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      let currency = this.currentUser.default_currency;
      this.currencySymbol = currencyMap[currency].symbol;
    })
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
