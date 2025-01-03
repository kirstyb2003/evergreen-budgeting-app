import { Component, Input, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatDate } from '../transaction-table/transaction-table.component';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';

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
  imports: [CdkDropList, CdkDrag],
  templateUrl: './display-savings-goals.component.html',
  styleUrl: './display-savings-goals.component.scss'
})
export class DisplaySavingsGoalsComponent implements OnInit {
  @Input({ required: true }) userID!: string;

  savingsGoals: SAVINGS_GOAL_STRUCTURE[] = [];

  constructor(private queryService: QueryService) { }

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
    moveItemInArray(this.savingsGoals, event.previousIndex, event.currentIndex);
  }
}
