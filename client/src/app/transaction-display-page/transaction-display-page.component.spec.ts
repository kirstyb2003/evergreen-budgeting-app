import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionDisplayPageComponent } from './transaction-display-page.component';
import { ActivatedRoute, NavigationEnd, provideRouter } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { of } from 'rxjs';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { DisplaySavingsGoalsComponent } from '../display-savings-goals/display-savings-goals.component';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TransactionDisplayPageComponent', () => {
  let component: TransactionDisplayPageComponent;
  let fixture: ComponentFixture<TransactionDisplayPageComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: '123', default_currency: 'GBP' }),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [TransactionDisplayPageComponent, MatButtonModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDisplayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create TransactionDisplayPageComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set current user and currency symbol on init', () => {
    expect(component.currentUser).toEqual({ user_id: '123', default_currency: 'GBP' });
    expect(component.currencySymbol).toBe('£');
  });

  it('should set transactionType to "expense" from route params', () => {
    component.transactionType = "expense";
    component.setUpValues();
    expect(component.transactionType).toBe('expense');
    expect(component.transactionTypeText).toBe('Expenses');
  });

  it('should set transactionType to "income" if param is null', () => {
    component.ngOnInit();
    expect(component.transactionType).toBe('income');
    expect(component.transactionTypeText).toBe('Income');
  });

  it('should update total when receiveTotal is called', () => {
    component.receiveTotal(500);
    expect(component.total).toBe(500);
  });

  it('should correctly bind the button text to log transaction type', () => {
    const buttonElement = fixture.debugElement.query(By.css('.button')).nativeElement;
    expect(buttonElement.textContent.trim()).toBe('Log New Income');
  });

  it('should render transaction tables with correct inputs', () => {
    const transactionTables = fixture.debugElement.queryAll(By.directive(TransactionTableComponent));
    expect(transactionTables.length).toBe(2); 
    expect(transactionTables[0].componentInstance.transactionType).toBe('income');
    expect(transactionTables[1].componentInstance.transactionType).toBe('income');
  });

  it('should render savings goal component when transactionType is "savings" and total is set', () => {
    component.transactionType = 'savings';
    component.total = 1000;
    fixture.detectChanges();

    const savingsGoals = fixture.debugElement.query(By.directive(DisplaySavingsGoalsComponent));
    expect(savingsGoals).toBeTruthy();
    expect(savingsGoals.componentInstance.amountSaved).toBe(1000);
  });

  it('should not render savings goal component if transactionType is not "savings"', () => {
    component.transactionType = 'expense';
    fixture.detectChanges();

    const savingsGoals = fixture.debugElement.query(By.directive(DisplaySavingsGoalsComponent));
    expect(savingsGoals).toBeFalsy();
  });
});
