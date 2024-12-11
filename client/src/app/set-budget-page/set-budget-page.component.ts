import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { NgIf, NgFor } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { currencyMap } from '../data-structures/currency-codes';

@Component({
  selector: 'app-set-budget-page',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatCheckboxModule, MatIcon],
  templateUrl: './set-budget-page.component.html',
  styleUrls: ['./set-budget-page.component.scss', '../form.component.scss']
})
export class SetBudgetPageComponent {
  currentUser!: any;
  currencySymbol!: String;

  budgetForm!: FormGroup;

  categoriesList!: { name: String }[];
  savingsList!: { name: String }[];

  prevUrl: string | null = null;

  numOfCategories: number = 0;
  numOfSavings: number = 0;

  loadedInBudget: Boolean = false;
  categoriesLoadedIn: { name: string, type: string }[] = [];
  categoriesSubmitted: { name: string, type: string }[] = [];

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar, private queryService: QueryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user.user;
      let currency = this.currentUser.default_currency;
      this.currencySymbol = currencyMap[currency].symbol;
    });

    this.route.queryParams.subscribe(params => {
      this.prevUrl = params['prev'] || '/';
    });

    this.budgetForm = new FormGroup({
      total: new FormControl('0'),
      total_budget: new FormControl('0'),
      budgetItems: new FormArray([]),
      savingsItems: new FormArray([]),
    });

    this.fetchCategories();
    this.fetchBudget();

    this.budgetForm.get('total')?.valueChanges.subscribe(() => this.updateSavingsTotal());
    this.budgetItems.valueChanges.subscribe(() => this.updateSavingsTotal());
  }

  fetchCategories() {
    this.getCategoriesList('expense').subscribe(categories => {
      this.categoriesList = categories;
      this.numOfCategories = this.categoriesList.length;
      // this.addBudgetItem(this.budgetItems, this.numOfCategories);
    });

    this.getCategoriesList('savings').subscribe(categories => {
      this.savingsList = categories;
      this.numOfSavings = this.savingsList.length;
    })
  }

  fetchBudget() {
    this.queryService.getBudget(this.currentUser.user_id).subscribe(budget => {
      budget.forEach((item: any) => {
        const control = this.createBudgetItem();
        control.patchValue({
          category: item.name,
          amount: item.amount,
        });

        if (item.category_type === 'expense') {
          this.budgetItems.push(control);
        } else if (item.category_type === 'savings') {
          this.savingsItems.push(control);
        }

        this.categoriesLoadedIn.push({ name: item.name, type: item.category_type });
      });

      if (this.budgetItems.length == 0) {
        this.addBudgetItem(this.budgetItems, 1);
        this.loadedInBudget = true;
      }

      this.calculateTotalBudgeted();
    });
  }

  addBudgetItem(control: FormArray, num: number) {
    if (control.length < num) {
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
    this.calculateTotalBudgeted();
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

    return this.categoriesList.filter(cat =>
      !selectedCategories.includes(cat.name));
  }

  getAvailableSavings(index: number): { name: String }[] {
    const selectedCategories = this.savingsItems.controls.map(
      (control, i) => i !== index ? control.get('category')?.value : null
    ).filter(value => value);

    return this.savingsList.filter(cat => !selectedCategories.includes(cat.name));
  }

  getDeletedCategories(): { name: string, type: string }[] {
    return this.categoriesLoadedIn.filter(loadedCat =>
      !this.categoriesSubmitted.some(submittedCat =>
        submittedCat.name === loadedCat.name && submittedCat.type === loadedCat.type
      )
    );
  }

  updateSavingsTotal() {
    const totalBudget = parseFloat(this.budgetForm.get('total')?.value || '0');

    if (totalBudget != 0) {
      const totalExpenses = this.budgetItems.controls.reduce((sum, control) => {
        return sum + parseFloat(control.get('amount')?.value || '0');
      }, 0);

      const savingsAmount = Math.max(0, totalBudget - totalExpenses);

      const savingsItem = this.savingsItems.controls.find((item) => item.get('category')?.value === 'Miscellaneous');
      if (savingsItem) {
        savingsItem.get('amount')?.setValue(savingsAmount.toString(), { emitEvent: false });
      } else {
        this.savingsItems.push(new FormGroup({
          category: new FormControl('Miscellaneous', Validators.required),
          amount: new FormControl(savingsAmount, Validators.required),
        }))
      }
    }

  }

  calculateTotalBudgeted(): void {
    let total = 0;

    this.budgetItems.controls.forEach((control) => {
      total += parseFloat(control.get('amount')?.value || '0');
    });

    this.savingsItems.controls.forEach((control) => {
      total += parseFloat(control.get('amount')?.value || '0');
    });

    this.budgetForm.get('total_budget')?.setValue(this.currencySymbol + total.toFixed(2));
    this.checkTotalBudgetWarning();
  }

  checkTotalBudgetWarning() {
    const totalBudgeted = parseFloat(this.budgetForm.get('total_budget')?.value.slice(1) || '0');
    const total = parseFloat(this.budgetForm.get('total')?.value || '0');

    if (totalBudgeted > total && total !== 0) {
      this.budgetForm.get('total_budget')?.setErrors({ warning: true }, { emitEvent: true });
      this.budgetForm.get('total_budget')?.markAsTouched();
    } else {
      this.budgetForm.get('total_budget')?.setErrors(null, { emitEvent: true });
    }
  }

  isOnlyWarningError(): boolean {
    let errors: String[] = [];
    Object.keys(this.budgetForm.controls).forEach(field => {
      const control = this.budgetForm.get(field);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          errors.push(errorKey);
        });
      }
    });

    const budgetArray = this.budgetForm.get('budgetItems') as FormArray;
    budgetArray.controls.forEach((budgetGroup, _index) => {
      if (budgetGroup instanceof FormGroup) {
        Object.keys(budgetGroup.controls).forEach(field => {
          const control = budgetGroup.get(field);
          if (control && control.errors) {
            Object.keys(control.errors).forEach(errorKey => {
              errors.push(errorKey);
            });
          }
        });
      }
    });

    const savingsArray = this.budgetForm.get('savingsItems') as FormArray;
    savingsArray.controls.forEach((savingsGroup, _index) => {
      if (savingsGroup instanceof FormGroup) {
        Object.keys(savingsGroup.controls).forEach(field => {
          const control = savingsGroup.get(field);
          if (control && control.errors) {
            Object.keys(control.errors).forEach(errorKey => {
              errors.push(errorKey);
            });
          }
        });
      }
    });

    return (errors.length === 1 && errors[0] === 'warning');
  }

  onSubmit() {
    if (this.budgetForm.invalid && !this.isOnlyWarningError()) {
      this.budgetForm.markAllAsTouched();
    } else {
      const budgetItems = this.budgetItems.controls.map(control => ({
        category: control.get('category')?.value,
        amount: control.get('amount')?.value,
        category_type: 'expense'
      }));

      const savingsItems = this.savingsItems.controls.map(control => ({
        category: control.get('category')?.value,
        amount: control.get('amount')?.value,
        category_type: 'savings'
      }));

      const allItems = budgetItems.concat(savingsItems);

      allItems.forEach((cat) => {
        this.categoriesSubmitted.push({ name: cat.category, type: cat.category_type });
      })

      this.queryService.setBudget(allItems, this.currentUser.user_id).subscribe({
        next: (_response) => {
          this.popup.open('Budget succeessfully saved.', 'Close', { duration: 3000 });
          this.router.navigateByUrl(this.prevUrl!);
        },
        error: (err) => {
          console.error('Error saving budget', err);
          this.popup.open('Error saving budget. Please try again.', 'Close', { duration: 3000 });
        },
      });

      const deleteCategories = this.getDeletedCategories();

      if (deleteCategories.length > 0) {
        this.queryService.deleteBudgetItems(deleteCategories, this.currentUser.user_id).subscribe({
          next: (_response) => {
            this.popup.open('Budget categories successfully deleted.', 'Close', { duration: 3000 });
          }, error: (err) => {
            console.error('Error deleting budget items', err);
            this.popup.open('Error deleting budget items. Please try again.', 'Close', { duration: 3000 });
          },
        })
      }


    }
  }

  get budgetItems(): FormArray {
    return this.budgetForm.get('budgetItems') as FormArray;
  }

  get savingsItems(): FormArray {
    return this.budgetForm.get('savingsItems') as FormArray;
  }

  get category() {
    return this.budgetForm.get("category")!;
  }

  get amount() {
    return this.budgetForm.get("amount")!;
  }
}
