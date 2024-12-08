import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { NgIf, NgFor } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-set-budget-page',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatCheckboxModule, MatIcon],
  templateUrl: './set-budget-page.component.html',
  styleUrls: ['./set-budget-page.component.scss', '../form.component.scss']
})
export class SetBudgetPageComponent {
  currentUser!: any;

  budgetForm!: FormGroup;

  categoriesList!: { name: String }[];
  savingsList!: { name: String }[];

  prevUrl: string | null = null;

  numOfCategories: number = 0;
  numOfSavings: number = 0;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
    });

    this.route.queryParams.subscribe(params => {
      this.prevUrl = params['prev'] || '/';
    });

    this.budgetForm = new FormGroup({
      total: new FormControl('0'),
      budgetItems: new FormArray([]),
      savingsItems: new FormArray([]),
    });

    this.fetchCategories();
  }

  fetchCategories() {
    this.getCategoriesList('expense').subscribe(categories => {
      this.categoriesList = categories;
      this.numOfCategories = this.categoriesList.length;
      this.addBudgetItem(this.budgetItems, this.numOfCategories);
    });

    this.getCategoriesList('savings').subscribe(categories => {
      this.savingsList = categories;
      this.numOfSavings = this.savingsList.length;
      this.addBudgetItem(this.savingsItems, this.numOfSavings);
    })
  }

  get budgetItems(): FormArray {
    return this.budgetForm.get('budgetItems') as FormArray;
  }

  get savingsItems(): FormArray {
    return this.budgetForm.get('savingsItems') as FormArray;
  }

  addBudgetItem(control: FormArray, num: number) {
    if ( control.length < num) {
      control.push(this.createBudgetItem());
    }
  }

  createBudgetItem(): FormGroup {
    return new FormGroup({
      category: new FormControl('', Validators.required),
      amount: new FormControl('0', Validators.required),
    })
  }

  removeBudgetItem(control: FormArray, index: number) {
    control.removeAt(index);
  }

  getCategoriesList(transaction_type: String): Observable<{ name: String }[]> {
    return this.queryService.getCategories(transaction_type).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving categories', error);
        return of([]);
      })
    );
  }

  getAvailableCategories(index: number): { name: String }[] {
    const selectedCategories = this.budgetItems.controls.map(
      (control, i) => i !== index ? control.get('category')?.value : null
    ).filter(value => value);
  
    return this.categoriesList.filter(cat => !selectedCategories.includes(cat.name));
  }

  getAvailableSavings(index: number): { name: String }[] {
    const selectedCategories = this.savingsItems.controls.map(
      (control, i) => i !== index ? control.get('category')?.value : null
    ).filter(value => value);
  
    return this.savingsList.filter(cat => !selectedCategories.includes(cat.name));
  }

  onSubmit() {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
    } else {
      const budgetItems = this.budgetForm.value.budgetItems.concat(this.budgetForm.value.savingsItems);

      let success = false;

      budgetItems.forEach((item: { category: string; amount: string }) => {
        this.queryService.setBudget(item, this.currentUser.user_id).subscribe({
          next: (_response) => {
            success = true;
            this.popup.open('Budget succeessfully saved.', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error saving budget', err);
            this.popup.open('Error saving budget. Please try again.', 'Close', { duration: 3000 });
          },
        });
      });

      if (success) {
        this.router.navigateByUrl(this.prevUrl!);
      }

    }
  }

  get category() {
    return this.budgetForm.get("category")!;
  }

  get amount() {
    return this.budgetForm.get("amount")!;
  }
}
