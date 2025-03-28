import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogTransactionPageComponent } from './log-transaction-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { QueryService } from '../services/query.service';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('LogTransactionPageComponent', () => {
  let component: LogTransactionPageComponent;
  let fixture: ComponentFixture<LogTransactionPageComponent>;
  let queryServiceMock: any;
  let authServiceMock: any;
  let snackBarMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: 123, username: 'JohnDoe', default_currency: 'USD' }),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    queryServiceMock = {
      getTransaction: jasmine.createSpy('getTransaction').and.returnValue(of({
        name: "Food Shop",
        category: "Groceries",
        type: "expense",
        transaction_date: "24/03/2025",
        amount: "20",
        shop: null,
        payment_method: null,
        repeat: false,
        repeat_schedule: null,
        end_date: null,
      })),
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of([
        { name: "Groceries" },
        { name: "Eating Out" },
        { name: "Clothes" },
        { name: "Salary" },
      ])),
      updateTransaction: jasmine.createSpy('updateTransaction').and.returnValue(of(0)),
      logTransaction: jasmine.createSpy('logTransaction').and.returnValue(of(0))
    };

    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerMock = null;

    await TestBed.configureTestingModule({
      imports: [LogTransactionPageComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: routerMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogTransactionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch categories based on selected type', () => {
    const categories = [{ name: 'Food' }, { name: 'Transport' }];
    queryServiceMock.getCategories.and.returnValue(of(categories));

    component.transactionForm.get('type')?.setValue('expense');
    fixture.detectChanges();

    expect(component.categoriesList.length).toBeGreaterThan(0);
    expect(component.categoriesList).toEqual(categories);
  });

  it('should show validation error if the form is invalid', () => {
    component.transactionForm.get('name')?.setValue('');
    component.transactionForm.get('amount')?.setValue('');
    component.transactionForm.markAllAsTouched();
    fixture.detectChanges();

    const nameError = fixture.nativeElement.querySelector('mat-error');
    expect(nameError).toBeTruthy();
  });

  it('should call logTransaction on submit for new transaction', () => {
    const transactionData = {
      type: 'expense',
      category: 'Food',
      name: 'Lunch',
      transaction_date: '2025-03-27',
      amount: 20,
      shop: 'Cafe',
      payment_method: 'cash',
      repeat: false,
      repeat_schedule: null,
      end_date: null,
      updateOption: "single",
    };
    component.transactionForm.setValue(transactionData);

    queryServiceMock.logTransaction.and.returnValue(of({}));

    component.onSubmit();

    const { updateOption: _, ...expectedData } = transactionData;

    expect(queryServiceMock.logTransaction).toHaveBeenCalledWith(
      expectedData,
      123,
      [transactionData.transaction_date]
    );

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Transaction successfully saved.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should call updateTransaction on submit for existing transaction', () => {
    component.transID = '12345';
    const updateOption = "all";
    const updatedData = {
      type: 'expense',
      category: 'Food',
      name: 'Dinner',
      transaction_date: '2025-03-27',
      amount: 50,
      shop: 'Restaurant',
      payment_method: 'credit',
      repeat: true,
      repeat_schedule: 'weekly',
      end_date: '2025-04-27',
      updateOption: updateOption
    };
    component.transactionForm.setValue(updatedData);

    queryServiceMock.updateTransaction.and.returnValue(of({}));

    component.onSubmit();

    const { updateOption: _, ...expectedData } = updatedData;

    expect(queryServiceMock.updateTransaction).toHaveBeenCalledWith(
      expectedData,
      '12345',
      updatedData.transaction_date,
      updateOption
    );

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Transaction successfully updated.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should handle error on submit for new transaction', () => {
    const transactionData = {
      type: 'expense',
      category: 'Food',
      name: 'Lunch',
      transaction_date: '2025-03-27',
      amount: 20,
      shop: 'Cafe',
      payment_method: 'cash',
      repeat: false,
      repeat_schedule: null,
      end_date: null,
      updateOption: "single"
    };
    component.transactionForm.setValue(transactionData);
    
    queryServiceMock.logTransaction.and.returnValue(throwError(() => new Error('Server error')));

    component.onSubmit();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Error saving transaction. Please try again.',
      'Close',
      { duration: 3000 }
    );
  });
});
