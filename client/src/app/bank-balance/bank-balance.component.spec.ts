import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankBalanceComponent } from './bank-balance.component';
import { of, throwError } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentCommunicationService } from '../services/component-communication.service';

describe('BankBalanceComponent', () => {
  let component: BankBalanceComponent;
  let fixture: ComponentFixture<BankBalanceComponent>;
  let authServiceMock: any;
  let queryServiceMock: any;
  let communicationServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: '123', default_currency: 'GBP' })
    };

    queryServiceMock = {
      getBalance: jasmine.createSpy('getBalance').and.returnValue(of(1000)),
      getTotal: jasmine.createSpy('getTotal').and.returnValue(of(500)),
      getMonthlyBudget: jasmine.createSpy('getMonthlyBudget').and.returnValue(of(2000)),
      getMonthlySpend: jasmine.createSpy('getMonthlySpend').and.returnValue(of(1500))
    };

    communicationServiceMock = {
      refresh$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [BankBalanceComponent],
      providers: [
        CurrencyPipe,
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: QueryService, useValue: queryServiceMock },
        { provide: ComponentCommunicationService, useValue: communicationServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set up user on initialisation', () => {
    expect(component.user_id).toBe('123');
  });

  it('should update values when pageType changes', () => {
    component.ngOnChanges({ pageType: { currentValue: 'budget', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.balanceHeader).toBe('Total Monthly Budget');
    expect(queryServiceMock.getMonthlyBudget).toHaveBeenCalled();
    expect(queryServiceMock.getMonthlySpend).toHaveBeenCalled();
  });

  it('should call query service methods on component setup', () => {
    expect(queryServiceMock.getBalance).toHaveBeenCalledWith('123');
    expect(queryServiceMock.getTotal).toHaveBeenCalledWith('123', 'income');
  });

  it('should emit calculateTotal when total is updated', () => {
    spyOn(component.calculateTotal, 'emit');
    component.setUpComponent();
    fixture.detectChanges();
    expect(component.calculateTotal.emit).toHaveBeenCalledWith(500);
  });

  it('should return correct styles for budget over-spending', () => {
    component.pageType = 'budget';
    component.balance = 1000;
    component.total = 1500;
    expect(component.getStyle()).toEqual({ color: 'red', 'font-weight': 'bold' });
  });

  it('should return default styles when not over budget', () => {
    component.pageType = 'budget';
    component.balance = 2000;
    component.total = 1500;
    expect(component.getStyle()).toEqual({ color: 'black', 'font-weight': 400 });
  });

  it('should display correct currency symbol with styling for a positive value (GBP)', () => {
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('£1,000.00');
    expect(bankBalanceElement.textContent).toContain('£500.00');
  });

  it('should display correct currency symbol with styling for a negative value (GBP)', () => {
    component.pageType = 'expense';
    component.balance = -2000;
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('-£2,000.00');
    expect(bankBalanceElement.textContent).toContain('£500.00');
  });

  it('should display correct currency symbol for USD', () => {
    authServiceMock.currentUser = of({ user_id: '123', default_currency: 'USD' });
    component.setUpUser();
    fixture.detectChanges();
  
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('$1,000.00');
    expect(bankBalanceElement.textContent).toContain('$500.00');
  });
  
  it('should display correct currency symbol for EUR', () => {
    authServiceMock.currentUser = of({ user_id: '123', default_currency: 'EUR' });
    component.setUpUser();
    fixture.detectChanges();
  
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('€1,000.00');
    expect(bankBalanceElement.textContent).toContain('€500.00');
  });

  it('should display correct currency symbol for > 1 character symbols (BZD)', () => {
    authServiceMock.currentUser = of({ user_id: '123', default_currency: 'BZD' });
    component.setUpUser();
    fixture.detectChanges();
  
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('BZ$1,000.00');
    expect(bankBalanceElement.textContent).toContain('BZ$500.00');
  });



  it('should display correct headers for expense', () => {
    component.ngOnChanges({pageType: {currentValue: 'expense', previousValue: null, firstChange: true, isFirstChange: () => true}});
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('Bank Balance');
    expect(bankBalanceElement.textContent).toContain('Total Spent (All Time)');
  });

  it('should display correct headers for income', () => {
    component.ngOnChanges({pageType: {currentValue: 'income', previousValue: null, firstChange: true, isFirstChange: () => true}});
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('Bank Balance');
    expect(bankBalanceElement.textContent).toContain('Total Income (All Time)');
  });

  it('should display correct headers for savings', () => {
    component.ngOnChanges({pageType: {currentValue: 'savings', previousValue: null, firstChange: true, isFirstChange: () => true}});
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('Bank Balance');
    expect(bankBalanceElement.textContent).toContain('Total Saved (All Time)');
  });

  it('should display correct headers for budget', () => {
    component.ngOnChanges({pageType: {currentValue: 'budget', previousValue: null, firstChange: true, isFirstChange: () => true}});
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('Total Monthly Budget');
    expect(bankBalanceElement.textContent).toContain('Net Monthly Spending');
  });

  it('should display correct headers for unknown page', () => {
    component.ngOnChanges({pageType: {currentValue: 'unknown', previousValue: null, firstChange: true, isFirstChange: () => true}});
    fixture.detectChanges();
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('Bank Balance');
    expect(bankBalanceElement.textContent).toContain('Total Income (All Time)');
  });

  it('should display currency symbol correctly for zero values', () => {
    component.balance = 0;
    component.total = 0;
    fixture.detectChanges();
    
    const bankBalanceElement: HTMLElement = fixture.nativeElement;
    expect(bankBalanceElement.textContent).toContain('£0.00');
  });

  it('should return default styles when budget matches total exactly', () => {
    component.pageType = 'budget';
    component.balance = 1500;
    component.total = 1500;
    fixture.detectChanges();

    expect(component.getStyle()).toEqual({ color: 'black', 'font-weight': 400 });
  });

  it('should return 0 and log an error when getBankBalance fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getBalance.and.returnValue(throwError(() => new Error('Server error')));
    
    component.getBankBalance().subscribe(result => {
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error retrieving bank balance', jasmine.any(Error));
    });
  });
  
  it('should return 0 and log an error when getTotal fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getTotal.and.returnValue(throwError(() => new Error('Server error')));
  
    component.getTotal().subscribe(result => {
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error retrieving total incomes', jasmine.any(Error));
    });
  });
  
  it('should return 0 and log an error when getMonthlyBudget fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getMonthlyBudget.and.returnValue(throwError(() => new Error('Server error')));
  
    component.getMonthlyBudget().subscribe(result => {
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error retrieving monthly budget total', jasmine.any(Error));
    });
  });
  
  it('should return 0 and log an error when getMonthlySpend fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getMonthlySpend.and.returnValue(throwError(() => new Error('Server error')));
  
    component.getMonthlySpend().subscribe(result => {
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error retrieving bank balance', jasmine.any(Error));
    });
  });

});

