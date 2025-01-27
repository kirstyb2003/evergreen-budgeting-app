import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { BankBalanceComponent } from "../bank-balance/bank-balance.component";
import { NgFor } from '@angular/common';

export interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
}

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [NavBarComponent, BankBalanceComponent, NgFor],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.scss'
})
export class BudgetPageComponent {
  total!: number;

  categories: BudgetCategory[] = [
    { name: 'Food', budget: 120, spent: 40 },
    { name: 'Eating Out', budget: 80, spent: 97 },
    { name: 'Transport', budget: 25, spent: 5.67 },
    { name: 'Fitness/Health', budget: 15, spent: 7.56 },
  ];

  receiveTotal(total: number) {
    this.total = total;
  }
}
