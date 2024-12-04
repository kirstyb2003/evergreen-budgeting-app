import { Component, Input} from '@angular/core';
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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {MatCheckboxModule} from '@angular/material/checkbox';

export const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-log-transaction-page',
  standalone: true,
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }],
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatDatepickerModule, MatCheckboxModule],
  templateUrl: './log-transaction-page.component.html',
  styleUrls: ['./log-transaction-page.component.scss', '../form.component.scss']
})
export class LogTransactionPageComponent {
  currentUser!: any;

  transactionType: string | null = null;
  typeList: String[] = ["expense", "income", "savings"];
  methodList: String[] = ["credit", "debit", "cheque", "cash"];
  repeatSchedList: String[] = ["daily", "weekly", "monthly", "yearly"];

  transactionForm!: FormGroup;

  categoriesList!: {name: String}[];

  prevUrl: string | null = null;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) {}

  ngOnInit(): void {
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user.user;
        console.log(this.currentUser);
      });

      this.route.queryParams.subscribe(params => {
        this.prevUrl = params['prev'] || '/';
      });

      this.route.paramMap.subscribe(params => {
        this.transactionType = params.get('type');
        this.initForm();
        if (this.transactionType) {
          this.fetchCategories();
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
      repeat: new FormControl(''),
      repeat_schedule: new FormControl(''),
      end_date: new FormControl(''),
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
  }

  fetchCategories() {
    this.getCategoriesList(this.transactionType!).subscribe(categories => {
      this.categoriesList = categories
    });
  }

  getCategoriesList(transaction_type: String): Observable<{name: String}[]> {
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
      this.queryService.logTransaction(this.transactionForm.value, this.currentUser.user_id).subscribe({
        next: (response) => {
          console.log('Transaction saved successfully!', response);
          this.router.navigateByUrl(this.prevUrl!);
          this.popup.open('Transaction succeessfully saved.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving transaction', err);
          this.popup.open('Please fill out all required fields!', 'Close', { duration: 3000 });
        },
      });
    }
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
}
