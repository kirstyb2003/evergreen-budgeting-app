import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { BankBalanceComponent } from "../bank-balance/bank-balance.component";

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [NavBarComponent, BankBalanceComponent],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.scss'
})
export class BudgetPageComponent {
  total!: number;

  receiveTotal(total: number) {
    this.total = total;
  }
}
