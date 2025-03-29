import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetTableComponent } from './budget-table.component';
import { QueryService } from '../services/query.service';
import { of, throwError } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { provideRouter, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BudgetTableComponent', () => {
  let component: BudgetTableComponent;
  let fixture: ComponentFixture<BudgetTableComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      getBudget: jasmine.createSpy('getBudget').and.returnValue(of([
        { name: "Groceries", category_type: "expense", amount: "300" },
        { name: "Transport", category_type: "expense", amount: "50" },
        { name: "Home Down Payment", category_type: "savings", amount: "350" },
        { name: "Clothes", category_type: "expense", amount: "20" },
      ])),
      getSpentAmount: jasmine.createSpy('getSpentAmount').and.returnValue(of(25)),
    };

    await TestBed.configureTestingModule({
      imports: [
        BudgetTableComponent,
        AgGridAngular,
        RouterModule.forRoot([]),
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule
      ],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetTableComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = 'GBP';
    component.currentUrl = '/budget';
    fixture.detectChanges();
  });

  it('should initialise the component correctly on ngOnInit', () => {
    spyOn(component, 'setupComponent');
    component.ngOnInit();
    expect(component.setupComponent).toHaveBeenCalled();
    expect(component.colDefs).toBeDefined();
  });

  it('should populate rowData and calculate total correctly', async () => {
    spyOn(component, 'calculateTotal');

    await component.getRowData();
    await fixture.whenStable();

    expect(component.rowData.length).toBe(4);
    expect(component.calculateTotal).toHaveBeenCalled();
  });

  it('should set up column definitions correctly', () => {
    component.setupComponent();
    expect(component.colDefs.length).toBeGreaterThan(0);
  });

  it('should update quick filter in ag-grid when search text is entered', () => {
    const inputElement = fixture.nativeElement.querySelector('#search');
    const gridApiMock = {
      setGridOption: jasmine.createSpy('setGridOption')
    };
    component.gridApi = gridApiMock as any;

    inputElement.value = 'Groceries';
    inputElement.dispatchEvent(new Event('input'));

    expect(gridApiMock.setGridOption).toHaveBeenCalledWith('quickFilterText', 'Groceries');
  });

  it('should handle error in getBudget gracefully', () => {
    queryServiceMock.getBudget.and.returnValue(throwError(() => new Error('Server Error')));
    spyOn(console, 'error');

    component.getRowData();
    expect(console.error).toHaveBeenCalledWith('Error retrieving budget', jasmine.any(Object));
  });

  it('should handle error in getSpentAmount gracefully', () => {
    queryServiceMock.getSpentAmount.and.returnValue(throwError(() => new Error('Server Error')));
    spyOn(console, 'error');

    component.getRowData()

    expect(console.error).toHaveBeenCalledWith("Error retrieving the spent amount for category 'Groceries'", jasmine.any(Error));
  });

  it('should correctly calculate total amounts when all values are valid numbers', () => {
    component.rowData = [
      { name: "Eating Out", category_type: "expense", amount: 100, spent: 50, left: "50" },
      { name: "Groceries", category_type: "expense", amount: 200, spent: 100, left: "100" }
    ];

    component.calculateTotal();

    expect(component.total).toEqual([
      { name: "Total:", amount: "300.00", spent: "150.00", left: "150.00" }
    ]);
  });

  it('should handle non-numeric values correctly', () => {
    component.rowData = [
      { name: "Eating Out", category_type: "expense", amount: 100, spent: undefined, left: undefined },
      { name: "Groceries", category_type: "expense", amount: NaN, spent: 100, left: "100" }
    ];

    component.calculateTotal();

    expect(component.total).toEqual([
      { name: "Total:", amount: "100.00", spent: "100.00", left: "100.00" }
    ]);
  });

  it('should update the grid filter text when gridApi is available', () => {
    component.gridApi = jasmine.createSpyObj('gridApi', ['setGridOption']);
    const searchBoxMock = { value: 'test' } as HTMLInputElement;
    spyOn(document, 'getElementById').and.returnValue(searchBoxMock);

    component.onFilterTextBoxChanged();

    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'test');
  });


  it('should log a warning when gridApi is not ready', () => {
    spyOn(console, 'warn');

    component.onFilterTextBoxChanged();

    expect(console.warn).toHaveBeenCalledWith('Grid API not ready yet!');
  });

  it('should set the grids pagination size when pageSize is valid', () => {
    component.pageSize = 23;
    component.setupComponent();

    expect(component.gridOptions.paginationPageSize).toBe(23);
  });

});
