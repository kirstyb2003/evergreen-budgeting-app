import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SetBudgetPageComponent } from './set-budget-page.component';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SetBudgetPageComponent', () => {
  let component: SetBudgetPageComponent;
  let fixture: ComponentFixture<SetBudgetPageComponent>;
  let mockAuthService: any;
  let mockQueryService: any;
  let snackBarMock: any;

  beforeEach(async () => {
    mockAuthService = {
      currentUser: of({ user_id: 1, default_currency: 'GBP' }),
      isLoggedIn: jasmine.createSpy("isLoggedIn").and.returnValue(of(true))
    };
    mockQueryService = {
      getCategories: jasmine.createSpy("getCategories").and.returnValue(of([{ name: 'Food' }, { name: 'Rent' }])),
      getBudget: jasmine.createSpy("getBudget").and.returnValue(of([])),
      setBudget: jasmine.createSpy("setBudget").and.returnValue(of({})),
      deleteBudgetItems: jasmine.createSpy("deleteBudgetItems").and.returnValue(of({}))
    };
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [SetBudgetPageComponent, ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: QueryService, useValue: mockQueryService },
        { provide: MatSnackBar, useValue: snackBarMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetBudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the form and fetch categories and budget', () => {
    expect(component.budgetForm).toBeDefined();
    expect(mockQueryService.getCategories).toHaveBeenCalledWith('expense');
    expect(mockQueryService.getCategories).toHaveBeenCalledWith('savings');
    expect(mockQueryService.getBudget).toHaveBeenCalledWith(1);
  });

  it('should add a budget item', () => {
    const initialLength = component.budgetItems.length;
    component.addBudgetItem(component.budgetItems, 5);
    expect(component.budgetItems.length).toBe(initialLength + 1);
  });

  it('should remove a budget item', () => {
    component.addBudgetItem(component.budgetItems, 5);
    const initialLength = component.budgetItems.length;
    component.removeBudgetItem(component.budgetItems, 0);
    expect(component.budgetItems.length).toBe(initialLength - 1);
  });

  it('should calculate total budgeted correctly', () => {
    component.budgetItems.push(component.createBudgetItem());
    component.budgetItems.at(0).patchValue({ amount: 100 });
    component.savingsItems.push(component.createBudgetItem());
    component.savingsItems.at(0).patchValue({ amount: 50 });
    component.calculateTotalBudgeted();
    expect(component.budgetForm.get('total_budget')?.value).toBe('£150.00');
  });

  it('should validate total budget warning', () => {
    component.budgetForm.patchValue({ total: 100 });
    component.budgetItems.push(component.createBudgetItem());
    component.budgetItems.at(0).patchValue({ amount: 150 });
    component.calculateTotalBudgeted();
    expect(component.budgetForm.get('total_budget')?.hasError('warning')).toBeTrue();
  });

  it('should submit the form successfully', async () => {
    component.budgetForm.markAsPristine();
    component.budgetForm.markAsUntouched();
    Object.keys(component.budgetForm.controls).forEach(key => {
      component.budgetForm.get(key)?.setErrors(null);
    });
    component.isOnlyWarningError = () => true;

    component.budgetItems.push(component.createBudgetItem());
    component.budgetItems.at(0).patchValue({ category: 'Food', amount: 100 });

    await component.onSubmit();
    await fixture.whenStable();

    expect(mockQueryService.setBudget).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Budget successfully saved.', 'Close', { duration: 3000 });
  });

  it('should handle form submission errors', async () => {
    component.budgetForm.markAsPristine();
    component.budgetForm.markAsUntouched();
    Object.keys(component.budgetForm.controls).forEach(key => {
      component.budgetForm.get(key)?.setErrors(null);
    });
    component.isOnlyWarningError = () => true;

    mockQueryService.setBudget.and.returnValue(throwError(() => new Error('Server error')));
    component.budgetItems.push(component.createBudgetItem());
    component.budgetItems.at(0).patchValue({ category: 'Food', amount: 100 });

    await component.onSubmit();
    await fixture.whenStable();

    expect(snackBarMock.open).toHaveBeenCalledWith('Error saving budget. Please try again.', 'Close', { duration: 3000 });
  });

  it('should handle empty expense categories in the budget by assigning an empty expense field', () => {
    mockQueryService.getBudget.and.returnValue(of([{ name: 'Home Down Payment', amount: 100, category_type: 'savings' }]));

    component.fetchBudget();

    expect(component.savingsItems.length).toBe(1);
    expect(component.budgetItems.length).toBe(1);
    expect(component.budgetItems.at(0)?.get('category')?.value).toBe('');
    expect(component.budgetItems.at(0)?.get('amount')?.value).toBe('0');
  });

  it('should handle empty savings categories in the budget', () => {
    mockQueryService.getBudget.and.returnValue(of([{ name: 'Food', amount: 100, category_type: 'expense' }]));

    component.ngOnInit();
    fixture.whenStable();

    expect(component.savingsItems.length).toBe(0);
    expect(component.budgetItems.length).toBe(1);
    expect(component.budgetItems.at(0)?.get('category')?.value).toBe('Food');
    expect(component.budgetItems.at(0)?.get('amount')?.value).toBe(100);
  });

  describe('isOnlyWarningError', () => {
    beforeEach(() => {
      // Remove validators for the test
      component.budgetForm = new FormGroup({
        total: new FormControl('100'),
        total_budget: new FormControl('£0.00'),
        budgetItems: new FormArray([]),
        savingsItems: new FormArray([]),
      });

      const budgetItem = new FormGroup({
        category: new FormControl('Food'),
        amount: new FormControl('50'),
      });
      component.budgetItems.push(budgetItem);

      const savingsItem = new FormGroup({
        category: new FormControl('Savings'),
        amount: new FormControl('50'),
      });
      component.savingsItems.push(savingsItem);

      Object.keys(component.budgetForm.controls).forEach(key => {
        component.budgetForm.get(key)?.setErrors(null);
      });
    });

    it('should return true if the only error is "warning"', () => {
      component.budgetForm.get('total_budget')?.setErrors({ warning: true });
      expect(component.isOnlyWarningError()).toBeTrue();
    });

    it('should return false if there are multiple errors', () => {
      component.budgetForm.get('total_budget')?.setErrors({ warning: true, required: true });
      expect(component.isOnlyWarningError()).toBeFalse();
    });

    it('should return false if there are no errors', () => {
      component.budgetForm.get('total_budget')?.setErrors(null);
      expect(component.isOnlyWarningError()).toBeFalse();
    });

    it('should return false if a budget item has errors', () => {
      const budgetItem = component.createBudgetItem();
      budgetItem.get('amount')?.setErrors({ required: true });
      component.budgetItems.push(budgetItem);

      expect(component.isOnlyWarningError()).toBeFalse();
    });

    it('should return false if a savings item has errors', () => {
      const savingsItem = component.createBudgetItem();
      savingsItem.get('amount')?.setErrors({ required: true });
      component.savingsItems.push(savingsItem);

      expect(component.isOnlyWarningError()).toBeFalse();
    });
  });

  describe('category and amount getters', () => {
    beforeEach(() => {
      component.budgetForm = new FormGroup({
        category: new FormControl('Food'),
        amount: new FormControl('100'),
      });
    });

    it('should return the category form control', () => {
      const categoryControl = component.category;
      expect(categoryControl).toBeTruthy();
      expect(categoryControl.value).toBe('Food');
    });

    it('should return the amount form control', () => {
      const amountControl = component.amount;
      expect(amountControl).toBeTruthy();
      expect(amountControl.value).toBe('100');
    });
  });

  describe('getAvailableSavings', () => {
    beforeEach(() => {
      component.savingsList = [
        { name: 'Emergency Fund' },
        { name: 'Vacation' },
        { name: 'Retirement' },
      ];

      const savingsItem1 = new FormGroup({
        category: new FormControl('Emergency Fund'),
        amount: new FormControl('100'),
      });

      const savingsItem2 = new FormGroup({
        category: new FormControl('Vacation'),
        amount: new FormControl('200'),
      });

      component.savingsItems.push(savingsItem1);
      component.savingsItems.push(savingsItem2);
    });

    it('should return available savings categories excluding already selected ones', () => {
      const availableSavings = component.getAvailableSavings(0);
      expect(availableSavings).toEqual([{ name: 'Emergency Fund' }, {name: 'Retirement' }]);
    });

    it('should include the current category of the given index', () => {
      const availableSavings = component.getAvailableSavings(1);
      expect(availableSavings).toEqual([
        { name: 'Vacation' },
        { name: 'Retirement' },
      ]);
    });

    it('should return all savings categories if none are selected', () => {
      component.savingsItems.clear();
      const availableSavings = component.getAvailableSavings(0);
      expect(availableSavings).toEqual([
        { name: 'Emergency Fund' },
        { name: 'Vacation' },
        { name: 'Retirement' },
      ]);
    });
  });
});
