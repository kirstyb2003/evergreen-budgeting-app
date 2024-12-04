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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { passwordStrengthValidator } from '../register-page/register-page.component';
import { QueryService } from '../services/query.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-log-transaction-page',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule],
  templateUrl: './log-transaction-page.component.html',
  styleUrls: ['./log-transaction-page.component.scss', '../form.component.scss']
})
export class LogTransactionPageComponent {
  currentUser!: any;

  transactionType: string | null = null;
  typeList: String[] = ["expense", "income", "savings"];

  transactionForm!: FormGroup;

  categoriesList!: {name: String}[];

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) {}

  ngOnInit(): void {
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user.user;
        console.log(this.currentUser);
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

  }

  get type() {
    return this.transactionForm.get("type")!;
  }

  get category() {
    return this.transactionForm.get("category")!;
  }
}
