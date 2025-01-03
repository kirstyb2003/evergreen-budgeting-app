import { Component, Input, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatDate } from '../transaction-table/transaction-table.component';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

type SAVINGS_GOAL_STRUCTURE = {
  goal_id: number,
  name: string,
  goal_amount: number,
  starting_savings: number,
  goal_due_date: string,
  ranking: number
}

@Component({
  selector: 'app-display-savings-goals',
  standalone: true,
  imports: [CdkDropList, CdkDrag, MatButtonModule],
  templateUrl: './display-savings-goals.component.html',
  styleUrl: './display-savings-goals.component.scss'
})
export class DisplaySavingsGoalsComponent implements OnInit {
  @Input({ required: true }) userID!: string;

  savingsGoals: SAVINGS_GOAL_STRUCTURE[] = [];

  touched: boolean = false;

  constructor(private queryService: QueryService, private popup: MatSnackBar) { }

  ngOnInit(): void {
    this.getSavingsGoals().subscribe(goals => {
      let formattedGoals = this.changeDatesToStrings(goals);
      this.savingsGoals = this.orderGoals(formattedGoals);
    });
  }

  getSavingsGoals(): Observable<SAVINGS_GOAL_STRUCTURE[]> {
    return this.queryService.getSavingsGoals(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving savings goals', error);
        return of([]);
      })
    );
  }

  changeDatesToStrings(goals: SAVINGS_GOAL_STRUCTURE[]): SAVINGS_GOAL_STRUCTURE[] {
    return goals.map(goal => ({
      ...goal,
      goal_due_date: formatDate(goal.goal_due_date)
    }));
  }

  orderGoals(goals: SAVINGS_GOAL_STRUCTURE[]): SAVINGS_GOAL_STRUCTURE[] {
    return goals.sort((a, b) => a.ranking - b.ranking);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (!this.touched) {
      this.touched = true;
    }
    moveItemInArray(this.savingsGoals, event.previousIndex, event.currentIndex);
    this.updateRanks();
  }

  updateRanks() {
    this.savingsGoals.forEach((goal, index) => {
      goal.ranking = index + 1;
    });
  }

  onRankingUpdate() {
    if (this.touched) {
      const idAndRanking = this.savingsGoals.map(goal => ({
        goal_id: goal.goal_id,
        ranking: goal.ranking
      }));

      this.queryService.updateGoalsRanking(idAndRanking).subscribe({
        next: (_response) => {
          this.popup.open('Goals ordering succeessfully saved.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving goals ordering', err);
          this.popup.open('Error saving goals ordering. Please try again.', 'Close', { duration: 3000 });
        },
      });
    } else {
      this.popup.open('Please reorder your goals before submitting.', 'Close', { duration: 3000 });
    }
  }
}
