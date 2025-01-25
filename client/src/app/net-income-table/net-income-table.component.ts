import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatMoney, numComparator } from '../transaction-table/transaction-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

ModuleRegistry.registerModules([AllCommunityModule]);

type ROW_DATA_STRUCTURE = {
  type: string,
  total: number,
}

@Component({
  selector: 'app-net-income-table',
  standalone: true,
  imports: [AgGridAngular, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './net-income-table.component.html',
  styleUrl: './net-income-table.component.scss'
})

export class NetIncomeTableComponent implements OnInit {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) currencySymbol!: string;

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    defaultColDef: {
      sortable: false,
      filter: false,
      resizable: true,
    },
    theme: themeAlpine,
    context: {
      reloadData: this.getRowData.bind(this),
    },
    rowClassRules: {
      'negative-balance': (params) => { return params.data.total < 0; },
      'positive-balance': (params) => { return params.data.total >= 0; },
    }
  };

  private gridApi!: GridApi;

  colDefs!: ColDef[];
  rowData: ROW_DATA_STRUCTURE[] = [];

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    this.setupComponent();
  }

  setupComponent() {
    this.getRowData();

    this.colDefs = [
      { field: "type", headerName: "Category", flex: 1},
      { field: "total", headerName: `Monthly Total (${this.currencySymbol})`, valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1 },
    ]
  }

  getRowData() {
    let net = 0.00;

    forkJoin({
      income: this.getIncomeAmount(),
      outgoings: this.getSpentAmount()
    }).subscribe(({ income, outgoings }) => {

      net = income - outgoings;
  
      this.rowData = [
        { type: "Income:", total: income },
        { type: "Outgoings:", total: outgoings },
        { type: "Net Income:", total: net }
      ];
    });
  }


  getSpentAmount(): Observable<number> {
    return this.queryService.getOutgoingsAmount(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total monthly outgoings.`, error);
        return of(0);
      })
    );
  }

  getIncomeAmount(): Observable<number> {
    return this.queryService.getIncomeAmount(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving total monthly income.`, error);
        return of(0);
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
