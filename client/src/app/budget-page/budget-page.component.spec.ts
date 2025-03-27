import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPageComponent } from './budget-page.component';
import { of, throwError } from 'rxjs';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { provideRouter } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { BankBalanceComponent } from '../bank-balance/bank-balance.component';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  template: '<div></div>',
  providers: [
    { provide: NavBarComponent, useValue: MockNavBarComponent }
  ]
})
export class MockNavBarComponent { }

@Component({
  selector: 'app-bank-balance',
  imports: [],
  template: '<div></div>',
  providers: [
    { provide: BankBalanceComponent, useValue: MockBankBalanceComponent }
  ]
})
export class MockBankBalanceComponent {
  @Input({ required: true }) pageType!: string | null;
}

describe('BugdetPageComponent', () => {
  let component: BudgetPageComponent;
  let fixture: ComponentFixture<BudgetPageComponent>;
  let authServiceMock: any;
  let queryServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: '123', default_currency: 'GBP' }),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    queryServiceMock = {
      getBudget: jasmine.createSpy('getBudget').and.returnValue(of([
        { name: "Groceries", category_type: "expense", amount: "300" },
        { name: "Transport", category_type: "expense", amount: "50" },
        { name: "Home Down Payment", category_type: "savings", amount: "350" },
        { name: "Clothes", category_type: "expense", amount: "20" },
      ])),
      getSpentAmount: jasmine.createSpy('getSpentAmount').and.returnValue(of(25)),
      getMonthlyBudget: jasmine.createSpy('getMonthlyBudget').and.returnValue(of(0)),
      getMonthlySpend: jasmine.createSpy('getMonthlySpend').and.returnValue(of(0))
    };


    routerMock = {
      url: of("/home")
    }

    await TestBed.configureTestingModule({
      imports: [BudgetPageComponent, MockNavBarComponent, MockBankBalanceComponent],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: QueryService, useValue: queryServiceMock },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise user and currency symbol', () => {
    expect(component.currentUser).toEqual({ user_id: '123', default_currency: 'GBP' });
    expect(component.currencySymbol).toBe('£');
  });

  it('should load budget categories', async () => {
    await fixture.whenStable();
    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categories.length).toBe(4);
    expect(component.categories[0].name).toBe('Groceries');
    expect(component.categories[0].spent).toBe(25);
  });

  it('should determine correct button label', async () => {
    await fixture.whenStable();

    fixture.detectChanges();
    let button = fixture.nativeElement.querySelector('.button');

    expect(button.textContent.trim()).toBe('Edit Budget');

    component.categories = [];
    fixture.detectChanges();
    await fixture.whenStable();

    button = fixture.nativeElement.querySelector('.button');
    expect(button.textContent.trim()).toBe('Set Budget');
  });

  it('should return [] and log an error when getBudget fails', () => {
      spyOn(console, 'error');
      queryServiceMock.getBudget.and.returnValue(throwError(() => new Error('Server error')));
    
      component.getBudget().subscribe(result => {
        expect(result).toEqual([]);
        expect(console.error).toHaveBeenCalledWith('Error retrieving budget', jasmine.any(Error));
      });
    });

    it('should return 0 and log an error when getSpent fails', () => {
      spyOn(console, 'error');
      queryServiceMock.getSpentAmount.and.returnValue(throwError(() => new Error('Server error')));
    
      component.getSpentAmount("Groceries", "expense").subscribe(result => {
        expect(result).toBe(0);
        expect(console.error).toHaveBeenCalledWith("Error retrieving the spent amount for category 'Groceries'", jasmine.any(Error));
      });
    });

    it('should set spent to 0 when getSpentAmount returns a non-numeric value', async () => {
      queryServiceMock.getSpentAmount.and.returnValue(of('invalid_data'));
    
      component.getCats();
      await fixture.whenStable();
      fixture.detectChanges();
    
      expect(component.categories.length).toBe(4);
      expect(component.categories[0].spent).toBe(0);
    });
});
