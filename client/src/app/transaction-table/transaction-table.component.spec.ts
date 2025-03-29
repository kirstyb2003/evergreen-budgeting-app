import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionTableComponent, formatMoney, formatDate, reverseFormatMoney, numComparator, formatPaymentMethod, filterParams } from './transaction-table.component';
import { QueryService } from '../services/query.service';
import { of, throwError } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TransactionTableComponent', () => {
  let component: TransactionTableComponent;
  let fixture: ComponentFixture<TransactionTableComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      getPastTransactions: jasmine.createSpy('getPastTransactions').and.returnValue(of([
        { name: 'Rent', category: "Bills", amount: 1000, transaction_date: "03/02/2025" },
        { name: 'Food Shop', category: "Groceries", amount: 200, transaction_date: "23/01/2025" },
      ])),
      getUpcomingTransactions: jasmine.createSpy('getUpcomingTransactions').and.returnValue(of([
        { name: 'Rent', category: "Bills", amount: 1000, transaction_date: "03/04/2025" },
        { name: 'Electricity', category: "Bills", amount: 120, transaction_date: "01/04/2025" },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionTableComponent, AgGridAngular, MatIconModule, MatButtonModule, MatTooltipModule],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionTableComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = '£';
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set up component correctly', () => {
    component.transactionType = 'expense';
    component.timeFrame = 'monthly';
    component.ngOnInit();
    expect(component.title).toBe('monthly expenses');
  });

  it('should handle errors when fetching past transactions', () => {
    queryServiceMock.getPastTransactions.and.returnValue(throwError(() => new Error('Error fetching data')));

    component.getPastTransactions().subscribe({
      next: (result) => expect(result).toEqual([]),
      error: (error) => expect(error.message).toBe('Error fetching data')
    });
  });


  it('should fetch past transactions successfully', () => {
    component.timeFrame = "past";
    component.getRowData();
    expect(component.rowData).toEqual([
      { name: 'Rent', category: "Bills", amount: 1000, transaction_date: "03/02/2025" },
      { name: 'Food Shop', category: "Groceries", amount: 200, transaction_date: "23/01/2025" },
    ]);
  });

  it('should calculate total correctly', () => {
    component.rowData = [
      { name: 'Rent', category: "Bills", amount: 1000, transaction_date: "03/02/2025" },
      { name: 'Food Shop', category: "Groceries", amount: 200, transaction_date: "23/01/2025" },
    ];
    component.calculateTotal();
    expect(component.total[0].amount).toBe('1200.00');
  });

  it('should format money correctly', () => {
    expect(formatMoney('1000', '£')).toBe('£1000.00');
    expect(formatMoney('-500', '€')).toBe('-€500.00');
  });

  it('should reverse format money correctly', () => {
    expect(reverseFormatMoney('£1,000.00', '£')).toBe(1000);
    expect(reverseFormatMoney('€500.50', '€')).toBe(500.50);
  });

  it('should format date correctly', () => {
    expect(formatDate('2023-03-28')).toBe('28/03/2023');
  });

  it('should compare numbers correctly', () => {
    expect(numComparator('£100.00', '£50.00', '£')).toBe(50);
    expect(numComparator('€200.00', '€300.00', '€')).toBe(-100);
  });

  it('should return empty string for null or empty dateString', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null as any)).toBe('');
  });

  it('should return empty string for invalid dateString', () => {
    expect(formatDate('invalid-date')).toBe('');
  });

  it('should return empty string for null or "null" payment method', () => {
    expect(formatPaymentMethod(null as any)).toBe('');
    expect(formatPaymentMethod('null')).toBe('');
  });

  it('should return "Bank Transfer" for "bank_transfer"', () => {
    expect(formatPaymentMethod('bank_transfer')).toBe('Bank Transfer');
  });

  it('should capitalise first letter of other payment methods', () => {
    expect(formatPaymentMethod('credit_card')).toBe('Credit_card');
  });

  it('should return -1 when dateAsString is null or empty', () => {
    expect(filterParams.comparator!(new Date(), null)).toBe(-1);
  });

  it('should compare dates correctly', () => {
    const filterDate = new Date(2025, 2, 3);
    expect(filterParams.comparator!(filterDate, '03/03/2025')).toBe(0);
    expect(filterParams.comparator!(filterDate, '02/03/2025')).toBe(-1);
    expect(filterParams.comparator!(filterDate, '04/03/2025')).toBe(1);
  });

  it('should return 0 if both numbers are NaN', () => {
    expect(numComparator('abc', 'xyz', '£')).toBe(0);
  });

  it('should return -1 if num1 is NaN and num2 is valid', () => {
    expect(numComparator('abc', '£100.00', '£')).toBe(-1);
  });

  it('should return 1 if num2 is NaN and num1 is valid', () => {
    expect(numComparator('£100.00', 'xyz', '£')).toBe(1);
  });

  it('should set gridApi when onGridReady is called', () => {
    const mockGridApi = {} as GridApi;

    const mockEvent = { api: mockGridApi } as GridReadyEvent;

    component.onGridReady(mockEvent);
    expect(component.gridApi).toBe(mockGridApi);
  });

  it('should handle errors and return an empty array when getUpcomingTransactions fails', (done) => {
    const errorResponse = new Error('API Failure');
    queryServiceMock.getUpcomingTransactions.and.returnValue(throwError(() => errorResponse));

    spyOn(console, 'error');

    component.getUpcomingTransactions().subscribe((result) => {
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error retrieving upcoming transactions', errorResponse);
      done();
    });
  });

  it('should set quickFilterText when gridApi is available', () => {
    component.gridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
  
    component.transactionType = 'expense';
    component.timeFrame = 'monthly';

    const inputElement = document.createElement('input');
    inputElement.id = 'monthly-expense';
    inputElement.value = 'Rent';
    document.body.appendChild(inputElement);
  
    component.onFilterTextBoxChanged();
  
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'Rent');
    document.body.removeChild(inputElement);
  });

  it('should warn when gridApi is not ready', () => {
    spyOn(console, 'warn');
    component.onFilterTextBoxChanged();

    expect(console.warn).toHaveBeenCalledWith('Grid API not ready yet!');
  });
  
  
});
