import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { AuthenticationService } from '../services/authentication.service';
import { NgIf, NgFor } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryService } from '../services/query.service';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import 'moment/locale/en-gb';
import moment from 'moment';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-log-transaction-page',
  standalone: true,
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, provideMomentDateAdapter()],
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatDatepickerModule, MatCheckboxModule, MatRadioModule],
  templateUrl: './log-transaction-page.component.html',
  styleUrls: ['../form.component.scss']
})
export class LogTransactionPageComponent {
  currentUser!: any;

  transactionType: string | null = null;
  transID: string | null = null;
  typeList: String[] = ["expense", "income", "savings"];
  methodList: String[] = ["credit", "debit", "cheque", "cash"];
  repeatSchedList: String[] = ["daily", "weekly", "monthly", "yearly"];

  transactionForm!: FormGroup;

  categoriesList!: { name: String }[];

  prevUrl: string | null = null;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
    });

    this.route.queryParams.subscribe(params => {
      this.prevUrl = params['prev'] || '/';
    });

    this.route.paramMap.subscribe(params => {
      this.transactionType = params.get('type');
      this.transID = params.get('id');

      this.initForm();

      if (this.transactionType && !this.transID) {
        this.fetchCategories();
      }

      if (this.transID) {
        this.fetchTransaction();
      }
    });
  }

  initForm() {
    this.transactionForm = new FormGroup({
      type: new FormControl(this.transactionType, Validators.required),
      category: new FormControl({ value: '', disabled: !this.transactionType }, Validators.required),
      name: new FormControl('', Validators.required),
      transaction_date: new FormControl('', Validators.required),
      amount: new FormControl('0', Validators.required),
      shop: new FormControl(''),
      payment_method: new FormControl(''),
      repeat: new FormControl(false),
      repeat_schedule: new FormControl(''),
      end_date: new FormControl(''),
      updateOption: new FormControl('single', Validators.required),
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.transactionType = type;
        this.transactionForm.get('category')?.enable();
        this.fetchCategories();
      } else {
        this.transactionForm.get('category')?.disable();
      }
    });

    this.transactionForm.get('repeat')?.valueChanges.subscribe((isRepeatChecked) => {
      const repeatScheduleControl = this.transactionForm.get('repeat_schedule');
      const endDateControl = this.transactionForm.get('end_date');
      if (isRepeatChecked) {
        repeatScheduleControl?.setValidators(Validators.required);
        endDateControl?.setValidators(Validators.required);
      } else {
        repeatScheduleControl?.clearValidators();
        endDateControl?.clearValidators();
      }
      repeatScheduleControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();
    });
  }

  fetchCategories() {
    this.getCategoriesList(this.transactionType!).subscribe(categories => {
      this.categoriesList = categories
    });
  }

  fetchTransaction() {
    this.queryService.getTransaction(this.transID!).subscribe(trans => {
      this.transactionForm.patchValue({
        name: trans.name,
        category: trans.category,
        type: trans.type,
        transaction_date: trans.transaction_date,
        amount: trans.amount,
        shop: trans.shop,
        payment_method: trans.payment_method,
        repeat: trans.repeat,
        repeat_schedule: trans.repeat_schedule,
        end_date: trans.end_date,
      });
    });

    this.fetchCategories();
  }

getCategoriesList(transaction_type: String): Observable < { name: String }[] > {
  return this.queryService.getCategories(transaction_type).pipe(
    map(response => response),
    catchError(error => {
      console.error('Error retrieving categories', error);
      return of([]);
    })
  );
}

onSubmit() {
  if (this.transactionForm.invalid) {
    this.transactionForm.markAllAsTouched();
  } else {
    const { updateOption, ...formValue } = this.transactionForm.value;

    let dates: String[];

    const transactionDate = moment(this.transactionForm.value.transaction_date).endOf('day').format('YYYY-MM-DD');
    formValue.transaction_date = transactionDate;

    if (formValue.repeat) {
      const endDate = this.transactionForm.value.end_date ? moment(this.transactionForm.value.end_date).endOf('day').format('YYYY-MM-DD') : null;
      formValue.end_date = endDate;

      dates = this.generateRepeatedDates(formValue);
    } else {
      dates = [formValue.transaction_date];
      formValue.repeat_schedule = null;
      formValue.end_date = null;
    }

    if (this.transID) {
      let updateOptionSend: "single" | "all" | "after" | null;
      
      if (!formValue.repeat) {
        updateOptionSend = null;
      } else {
        updateOptionSend = updateOption;
      }

      this.queryService.updateTransaction(formValue, this.transID, formValue.transaction_date, updateOptionSend).subscribe({
        next: (_response) => {
          this.router.navigateByUrl(this.prevUrl!);
          this.popup.open('Transaction succeessfully updated.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error updating transaction', err);
          this.popup.open('Error updating transaction. Please try again.', 'Close', { duration: 3000 });
        },
      });
    } else {
      this.queryService.logTransaction(formValue, this.currentUser.user_id, dates).subscribe({
        next: (_response) => {
          this.router.navigateByUrl(this.prevUrl!);
          this.popup.open('Transaction succeessfully saved.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving transaction', err);
          this.popup.open('Error saving transaction. Please try again.', 'Close', { duration: 3000 });
        },
      });
    }
  }
}

generateRepeatedDates(formData: any): String[] {
  const startDate = moment(formData.transaction_date, 'YYYY-MM-DD');
  const endDate = moment(formData.end_date, 'YYYY-MM-DD');
  const repeatSchedule = formData.repeat_schedule;

  const dates: String[] = [];

  dates.push(startDate.format('YYYY-MM-DD'));

  let currentDate = startDate.clone();

  while (currentDate.isBefore(endDate)) {
    switch (repeatSchedule) {
      case 'daily':
        currentDate.add(1, 'day');
        break;
      case 'weekly':
        currentDate.add(1, 'week');
        break;
      case 'monthly':
        currentDate.add(1, 'month');
        break;
      case 'yearly':
        currentDate.add(1, 'year');
        break;
    }

    if (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));
    }
  }
  return dates;
}

  get type() {
  return this.transactionForm.get("type")!;
}

  get category() {
  return this.transactionForm.get("category")!;
}

  get name() {
  return this.transactionForm.get("name")!;
}

  get transaction_date() {
  return this.transactionForm.get("transaction_date")!;
}

  get amount() {
  return this.transactionForm.get("amount")!;
}

  get repeat() {
  return this.transactionForm.get("repeat")!;
}

  get repeat_schedule() {
  return this.transactionForm.get("repeat_schedule")!;
}

  get end_date() {
  return this.transactionForm.get('end_date')!;
}
}
