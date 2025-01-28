import { Component, Input, OnInit, ChangeDetectionStrategy, inject, Inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatDate } from '../transaction-table/transaction-table.component';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

type SAVINGS_GOAL_STRUCTURE = {
  goal_id: number,
  name: string,
  goal_amount: number,
  starting_savings: number,
  goal_due_date: string,
  ranking: number,
  currently_saved?: number,
}

@Component({
    selector: 'app-display-savings-goals',
    imports: [CdkDropList, CdkDrag, MatButtonModule, RouterLink, MatIcon, MatDialogModule, NgIf, MatProgressBarModule],
    templateUrl: './display-savings-goals.component.html',
    styleUrl: './display-savings-goals.component.scss'
})
export class DisplaySavingsGoalsComponent implements OnInit {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) amountSaved!: number;
  @Input({ required: true }) currencySymbol!: string;

  savingsGoals: SAVINGS_GOAL_STRUCTURE[] = [];

  touched: boolean = false;

  currentUrl!: String;

  readonly dialog = inject(MatDialog);

  constructor(private router: Router, private queryService: QueryService, private popup: MatSnackBar) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    this.setupGoals();
  }

  setupGoals() {
    this.getSavingsGoals().subscribe(goals => {
      let formattedGoals = this.changeDatesToStrings(goals);
      this.savingsGoals = this.orderGoals(formattedGoals);
      this.calculateTotals();
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
    this.calculateTotals();
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

  calculateTotals() {
    let remainingSavings = this.amountSaved;

    this.savingsGoals = this.savingsGoals.map(goal => {
      const startingSavings = Number(goal.starting_savings);
      const goalAmount = Number(goal.goal_amount);
      const maxContribution = goalAmount - startingSavings;
      let contribution = 0.00;

      if (remainingSavings > 0) {
        if (remainingSavings >= maxContribution) {
          contribution = maxContribution + startingSavings;
          remainingSavings -= maxContribution;
        } else {
          contribution = remainingSavings + startingSavings;
          remainingSavings = 0;
        }
      } else {
        contribution = startingSavings;
      }

      return {
        ...goal,
        currently_saved: contribution
      };
    });
  }

  formatMoney(amount: number): string {
    return `${this.currencySymbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }


  openDeleteDialog(goal: SAVINGS_GOAL_STRUCTURE) {
    const dialogRef = this.dialog.open(DialogDeleteGoal, {
      data: { name: goal.name, title: "Savings Goal", type: "savings goal", buttonText: "Goal", repeat: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      
      if (result) {
        this.removeSavingsGoal(goal.goal_id);
      }
    });
  }

  removeSavingsGoal(id: number) {
    this.queryService.deleteSavingsGoal(id, this.userID).subscribe({
      next: (_response) => {
        this.popup.open('Goal successfully deleted', 'Close', { duration: 3000 });
        this.setupGoals();
      },
      error: (err) => {
        console.error('Error deleting savings goal.', err);
        this.popup.open('Error deleting savings goal. Please try again.', 'Close', { duration: 3000 });
      },
    });
  }
}

@Component({
    selector: 'dialog-delete-goal',
    templateUrl: 'delete-confirmation-dialog.html',
    styleUrl: 'delete-confirmation-dialog.scss',
    imports: [MatDialogModule, MatButtonModule, NgIf, MatRadioModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogDeleteGoal {
  selectedOption: 'single' | 'all' | 'after' = 'single';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string, title: string, type: string, buttonText: string, repeat: boolean }) { }
}
