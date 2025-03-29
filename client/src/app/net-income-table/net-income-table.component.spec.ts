import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NetIncomeTableComponent } from './net-income-table.component';
import { QueryService } from '../services/query.service';
import { AgGridAngular } from 'ag-grid-angular';
import { GridReadyEvent } from 'ag-grid-community';

describe('NetIncomeTableComponent', () => {
  let component: NetIncomeTableComponent;
  let fixture: ComponentFixture<NetIncomeTableComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      getIncomeAmount: jasmine.createSpy('getIncomeAmount').and.returnValue(of(1000)),
      getOutgoingsAmount: jasmine.createSpy('getOutgoingsAmount').and.returnValue(of(700))
    };

    await TestBed.configureTestingModule({
      imports: [NetIncomeTableComponent, AgGridAngular],
      providers: [
        { provide: QueryService, useValue: queryServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NetIncomeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise column definitions correctly', () => {
    component.ngOnInit();
    expect(component.colDefs.length).toBe(2);
    expect(component.colDefs[0].field).toBe('type');
    expect(component.colDefs[1].field).toBe('total');
  });

  it('should set rowData correctly when getRowData is called', () => {
    component.getRowData();
    expect(component.rowData).toEqual([
      { type: 'Income:', total: 1000 },
      { type: 'Outgoings:', total: 700 },
      { type: 'Net Income:', total: 300 }
    ]);
  });

  it('should handle errors when fetching income or outgoings', () => {
    queryServiceMock.getIncomeAmount.and.returnValue(throwError(() => new Error('Error retrieving income')));
    queryServiceMock.getOutgoingsAmount.and.returnValue(throwError(() => new Error('Error retrieving outgoings')));

    component.getRowData();
    expect(component.rowData).toEqual([
      { type: 'Income:', total: 0 },
      { type: 'Outgoings:', total: 0 },
      { type: 'Net Income:', total: 0 }
    ]);
  });

  it('should set the grid API when onGridReady is called', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['sizeColumnsToFit']);
    const event: GridReadyEvent = { api: mockGridApi } as GridReadyEvent;
    component.onGridReady(event);
    expect(component.gridApi).toBe(mockGridApi);
  });
});
