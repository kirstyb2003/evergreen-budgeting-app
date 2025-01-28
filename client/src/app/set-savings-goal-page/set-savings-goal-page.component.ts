import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { AuthenticationService } from '../services/authentication.service';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryService } from '../services/query.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import 'moment/locale/en-gb';
import moment from 'moment';

@Component({
    selector: 'app-set-savings-goal-page',
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, provideMomentDateAdapter()],
    imports: [NavBarComponent, ReactiveFormsModule, NgIf, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatDatepickerModule, MatCheckboxModule],
    templateUrl: './set-savings-goal-page.component.html',
    styleUrls: ['../form.component.scss']
})
export class SetSavingsGoalPageComponent {
  currentUser!: any;

  savingsForm!: FormGroup;

  prevUrl: string | null = null;

  goalID: string | null = null;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
    });

    this.route.queryParams.subscribe(params => {
      this.prevUrl = params['prev'] || '/';
    });

    this.initForm();

    this.route.paramMap.subscribe(params => {
      this.goalID = params.get('id');
      if (this.goalID) {
        this.fetchGoal();
      }
    });


  }

  initForm() {
    this.savingsForm = new FormGroup({
      name: new FormControl('', Validators.required),
      target_amount: new FormControl('', Validators.required),
      goal_date: new FormControl(''),
      starting_amount: new FormControl('0', Validators.required),
    });
  }

  fetchGoal() {
    this.queryService.getSavingsGoal(this.goalID!).subscribe(goal => {
      this.savingsForm.patchValue({
        name: goal.name,
        target_amount: goal.goal_amount,
        goal_date: moment(goal.goal_due_date).toDate(),
        starting_amount: goal.starting_savings,
      });
    });
  }

  onSubmit() {
    if (this.savingsForm.invalid) {
      this.savingsForm.markAllAsTouched();
    } else {
      const formValue = { ...this.savingsForm.value };

      if (this.savingsForm.value.goal_date) {
        const savingsDate = moment(this.savingsForm.value.goal_date).endOf('day').format('YYYY-MM-DD');
        formValue.goal_date = savingsDate;
      } else {
        formValue.goal_date = null;
      }

      if (this.goalID) {
        this.queryService.updateSavingsGoal(this.goalID, formValue).subscribe({
          next: (_response) => {
            this.router.navigateByUrl(this.prevUrl!);
            this.popup.open('Savings goal succeessfully updated.', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error updating goal', err);
            this.popup.open('Error updating goal. Please try again.', 'Close', { duration: 3000 });
          },
        });
      } else {
        this.queryService.setSavingsGoal(formValue, this.currentUser.user_id).subscribe({
          next: (_response) => {
            this.router.navigateByUrl(this.prevUrl!);
            this.popup.open('Savings goal succeessfully saved.', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error saving goal', err);
            this.popup.open('Error saving goal. Please try again.', 'Close', { duration: 3000 });
          },
        });
      }

    }
  }

  get name() {
    return this.savingsForm.get("name")!;
  }

  get goal_date() {
    return this.savingsForm.get("goal_date")!;
  }

  get target_amount() {
    return this.savingsForm.get("target_amount")!;
  }

  get starting_amount() {
    return this.savingsForm.get("starting_amount")!;
  }
}

