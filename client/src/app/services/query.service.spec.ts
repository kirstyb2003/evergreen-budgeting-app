import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QueryService } from './query.service';
import { AuthenticationService } from './authentication.service';
import { provideHttpClient } from '@angular/common/http';

describe('QueryService', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      logout: jasmine.createSpy('logout'),
      displayExpiredTokenPopup: jasmine.createSpy('displayExpiredTokenPopup'),
    };

    TestBed.configureTestingModule({
      providers: [
        QueryService,
        { provide: AuthenticationService, useValue: mockAuthService },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle 403 errors by logging out and displaying a popup', () => {
    service.getCategories('expense').subscribe();
    const req = httpMock.expectOne(`${service['apiUrl']}/categories/expense`);
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockAuthService.displayExpiredTokenPopup).toHaveBeenCalled();
  });

  it('should fetch categories', () => {
    const mockResponse = [{ name: 'Food' }, { name: 'Rent' }];

    service.getCategories('expense').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/categories/expense`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should log a transaction', () => {
    const mockTransaction = { category: 'Food', amount: 100 };
    const mockResponse = { message: 'Transaction logged successfully' };

    service.logTransaction(mockTransaction, '1', ['2023-01-01']).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should set a budget', () => {
    const mockBudget = [{ category: 'Food', amount: '100', category_type: 'expense' }];
    const mockResponse = { message: 'Budget set successfully' };

    service.setBudget(mockBudget, '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should fetch a budget', () => {
    const mockResponse = [{ name: 'Food', amount: 100, category_type: 'expense' }];

    service.getBudget('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should delete budget items', () => {
    const mockDeleteCategories = [{ name: 'Food', type: 'expense' }];
    const mockResponse = { message: 'Budget items deleted successfully' };

    service.deleteBudgetItems(mockDeleteCategories, '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/delete/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle errors gracefully', () => {
    service.getCategories('expense').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/categories/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fetch savings goals', () => {
    const mockResponse = [{ goal: 'Emergency Fund', amount: 1000 }];

    service.getSavingsGoals('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update savings goals ranking', () => {
    const mockRankings = [{ goal_id: 1, ranking: 1 }];
    const mockResponse = { message: 'Rankings updated successfully' };

    service.updateGoalsRanking(mockRankings).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/update`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a savings goal', () => {
    const mockResponse = { message: 'Savings goal deleted successfully' };

    service.deleteSavingsGoal(1, '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/delete/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});

describe('QueryService - Additional Functions', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch weekly categories', () => {
    const mockResponse = [{ category: 'Food', amount: 100 }];
    service.getWeeklyCats('expense', '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/week/expense`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch monthly categories', () => {
    const mockResponse = [{ category: 'Rent', amount: 500 }];
    service.getMonthlyCats('expense', '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/month/expense`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch yearly categories', () => {
    const mockResponse = [{ category: 'Utilities', amount: 1200 }];
    service.getYearlyCats('expense', '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/year/expense`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch weekly time series', () => {
    const mockResponse = [{ week: '2023-W01', amount: 200 }];
    service.getWeeklyTimeSeries('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/timeseries/week`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch monthly time series', () => {
    const mockResponse = [{ month: '2023-01', amount: 800 }];
    service.getMonthlyTimeSeries('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/timeseries/month`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch yearly time series', () => {
    const mockResponse = [{ year: '2023', amount: 9600 }];
    service.getYearlyTimeSeries('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/timeseries/year`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch weekly expenses', () => {
    const mockResponse = [{ week: '2023-W01', amount: 150 }];
    service.getWeeklyExpenses('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/expenses/week`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch monthly expenses', () => {
    const mockResponse = [{ month: '2023-01', amount: 600 }];
    service.getMonthlyExpenses('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/expenses/month`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch yearly expenses', () => {
    const mockResponse = [{ year: '2023', amount: 7200 }];
    service.getYearlyExpenses('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/expenses/year`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch a specific savings goal', () => {
    const mockResponse = { goal: 'Emergency Fund', amount: 1000 };
    service.getSavingsGoal('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goal/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should delete a transaction', () => {
    const mockResponse = { message: 'Transaction deleted successfully' };
    const payload = { repeatDelete: 'single', date: '2023-01-01' };

    service.deleteTransaction(1, 'single', '2023-01-01').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transaction/delete/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should update a transaction', () => {
    const mockTransaction = { category: 'Food', amount: 100 };
    const mockResponse = { message: 'Transaction updated successfully' };
    const payload = { ...mockTransaction, date: '2023-01-01' };

    service.updateTransaction(mockTransaction, '1', '2023-01-01', 'single').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/update/single/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should fetch the monthly budget', () => {
    const mockResponse = { totalBudget: 2000 };

    service.getMonthlyBudget('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/total/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch the monthly spend', () => {
    const mockResponse = { totalSpent: 1500 };

    service.getMonthlySpend('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/spent/month/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch the spent amount for a specific category and type', () => {
    const mockResponse = { spentAmount: 500 };

    service.getSpentAmount('1', 'Food', 'expense').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/spent/1/Food/expense`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

describe('QueryService - Savings Goal Functions', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should set a savings goal', () => {
    const mockSavingsInfo = { goal: 'Emergency Fund', amount: 1000 };
    const mockResponse = { message: 'Savings goal set successfully' };

    service.setSavingsGoal(mockSavingsInfo, '1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goal/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSavingsInfo);
    req.flush(mockResponse);
  });

  it('should update a savings goal', () => {
    const mockSavingsInfo = { goal: 'Emergency Fund', amount: 1500 };
    const mockResponse = { message: 'Savings goal updated successfully' };

    service.updateSavingsGoal('1', mockSavingsInfo).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goal/update/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSavingsInfo);
    req.flush(mockResponse);
  });
});

describe('QueryService - Transaction Functions', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch a specific transaction', () => {
    const mockResponse = { id: '1', category: 'Food', amount: 100 };

    service.getTransaction('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transaction/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

describe('QueryService - Error Handling', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      logout: jasmine.createSpy('logout'),
      displayExpiredTokenPopup: jasmine.createSpy('displayExpiredTokenPopup'),
    };

    TestBed.configureTestingModule({
      providers: [
        QueryService,
        { provide: AuthenticationService, useValue: mockAuthService },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle 403 errors by logging out and displaying a popup', () => {
    service.getCategories('expense').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/categories/expense`);
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockAuthService.displayExpiredTokenPopup).toHaveBeenCalled();
  });

  it('should handle 500 errors gracefully', () => {
    service.getCategories('expense').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/categories/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for logTransaction', () => {
    service.logTransaction({}, '1', []).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for setBudget', () => {
    service.setBudget([], '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getBudget', () => {
    service.getBudget('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for deleteBudgetItems', () => {
    service.deleteBudgetItems([], '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/delete/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for setSavingsGoal', () => {
    service.setSavingsGoal({}, '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goal/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for updateSavingsGoal', () => {
    service.updateSavingsGoal('1', {}).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goal/update/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getTransaction', () => {
    service.getTransaction('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transaction/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for deleteTransaction', () => {
    service.deleteTransaction(1, 'single', '2023-01-01').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transaction/delete/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for updateTransaction', () => {
    service.updateTransaction({}, '1', '2023-01-01', 'single').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/update/single/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getMonthlyBudget', () => {
    service.getMonthlyBudget('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/budget/total/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getMonthlySpend', () => {
    service.getMonthlySpend('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/spent/month/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getSpentAmount', () => {
    service.getSpentAmount('1', 'Food', 'expense').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/spent/1/Food/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getBalance', () => {
    service.getBalance('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/balance/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getTotal', () => {
    service.getTotal('1', 'expense').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/balance/1/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getTotalGoalAmount', () => {
    service.getTotalGoalAmount('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/total-goal/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getPastTransactions', () => {
    service.getPastTransactions('expense', '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/past/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getUpcomingTransactions', () => {
    service.getUpcomingTransactions('expense', '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/transactions/1/upcoming/expense`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for getSavingsGoals', () => {
    service.getSavingsGoals('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for updateGoalsRanking', () => {
    const mockRankings = [{ goal_id: 1, ranking: 1 }];

    service.updateGoalsRanking(mockRankings).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/update`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors for deleteSavingsGoal', () => {
    service.deleteSavingsGoal(1, '1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/savings-goals/delete/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });
});
