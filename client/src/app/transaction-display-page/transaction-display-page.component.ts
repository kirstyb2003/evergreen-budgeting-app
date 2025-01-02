import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { BankBalanceComponent } from "../bank-balance/bank-balance.component";

@Component({
  selector: 'app-transaction-display-page',
  standalone: true,
  imports: [NavBarComponent, BankBalanceComponent],
  templateUrl: './transaction-display-page.component.html',
  styleUrl: './transaction-display-page.component.scss'
})
export class TransactionDisplayPageComponent {
  currentUser!: any;

  transactionType: string | null = null;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
    });

    this.route.paramMap.subscribe(params => {
      this.transactionType = params.get('type');
    });
  }
}
