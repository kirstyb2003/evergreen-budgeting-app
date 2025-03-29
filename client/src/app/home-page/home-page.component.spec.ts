import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageComponent } from './home-page.component';
import { AuthenticationService } from '../services/authentication.service';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { currencyMap } from '../data-structures/currency-codes';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { TransactionTableComponent } from "../transaction-table/transaction-table.component";
import { BudgetTableComponent } from "../budget-table/budget-table.component";
import { NetIncomeTableComponent } from "../net-income-table/net-income-table.component";
import { SavingsAreaComponent } from "../savings-area/savings-area.component";
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: 1, username: 'JohnDoe', default_currency: 'USD' }),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent,
        NavBarComponent,
        TransactionTableComponent,
        BudgetTableComponent,
        NetIncomeTableComponent,
        SavingsAreaComponent,
      ],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting() 
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to currentUser and set the currency symbol correctly', () => {
    expect(component.currentUser.username).toBe('JohnDoe');
    expect(component.currencySymbol).toBe(currencyMap['USD'].symbol);
  });

  it('should render the NavBarComponent', () => {
    const navBarComponent = fixture.nativeElement.querySelector('app-nav-bar');
    expect(navBarComponent).toBeTruthy();
  });

  it('should render the BudgetTableComponent with correct inputs', () => {
    const budgetTableComponent = fixture.debugElement.query(By.css('app-budget-table')).componentInstance;
  
    expect(budgetTableComponent).toBeTruthy();
    expect(budgetTableComponent.userID).toBe(1);
    expect(budgetTableComponent.currencySymbol).toBe(currencyMap['USD'].symbol);
  });

  it('should render the TransactionTableComponent with correct inputs', () => {
    const incomeTableComponent = fixture.debugElement.query(By.css('.income-table')).componentInstance;
    const expenseTableComponent = fixture.debugElement.query(By.css('.expense-table')).componentInstance;
  
    expect(incomeTableComponent).toBeTruthy();
    expect(expenseTableComponent).toBeTruthy();

    expect(incomeTableComponent.userID).toBe(1);
    expect(incomeTableComponent.currencySymbol).toBe(currencyMap['USD'].symbol);
  
    expect(expenseTableComponent.userID).toBe(1);
    expect(expenseTableComponent.currencySymbol).toBe(currencyMap['USD'].symbol);
  });
  

  it('should render the SavingsAreaComponent with correct inputs', () => {
  const savingsAreaComponent = fixture.debugElement.query(By.css('.savings-area')).componentInstance;

  expect(savingsAreaComponent).toBeTruthy();
  expect(savingsAreaComponent.userID).toBe(1);
  expect(savingsAreaComponent.currencySymbol).toBe(currencyMap['USD'].symbol);
});

});
