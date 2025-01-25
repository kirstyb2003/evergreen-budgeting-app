import { Component, Input, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-savings-area',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIcon, MatProgressBarModule, MatTooltipModule],
  templateUrl: './savings-area.component.html',
  styleUrl: './savings-area.component.scss'
})

export class SavingsAreaComponent implements OnInit {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) currencySymbol!: string;

  currently_saved: number = 0.00;
  goal_amount: number = 0.00;

  currentUrl!: String;

  constructor(private router: Router, private queryService: QueryService, private popup: MatSnackBar) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    this.setupGoals();
  }

  setupGoals() {
    this.getTotalSaved().subscribe(total => {
      this.currently_saved += total;
    });

    this.getTotalGoal().subscribe((value: { total_goal: number, total_starting: number }) => {
      this.goal_amount = value.total_goal;
      this.currently_saved += value.total_starting;
    })
  }

  getTotalSaved(): Observable<number> {
    return this.queryService.getTotal(this.userID, 'savings').pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total savings`, error);
        return of(0);
      })
    );
  }

  getTotalGoal(): Observable<{ total_goal: number, total_starting: number }> {
    return this.queryService.getTotalGoalAmount(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total goal amount`, error);
        return of({ total_goal: 0.00, total_starting: 0.00 });
      })
    );
  }

  formatMoney(amount: number): string {
    return `${this.currencySymbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

