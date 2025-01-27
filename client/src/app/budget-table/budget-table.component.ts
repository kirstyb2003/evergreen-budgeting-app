import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatMoney, numComparator } from '../transaction-table/transaction-table.component';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

ModuleRegistry.registerModules([AllCommunityModule]);

type ROW_DATA_STRUCTURE = {
  name: string,
  category_type: string,
  amount: number,
  spent?: number,
  left?: string,
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [AgGridAngular, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatTooltip],
  templateUrl: './budget-table.component.html',
  styleUrl: './budget-table.component.scss'
})
export class BudgetTableComponent implements OnInit {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) currencySymbol!: string;
  @Input({ required: true }) currentUrl!: string;
  @Input() pageSize?: number;

  total: any[] = [
    {
      actions: "Total:",
      amount: 0.00
    },
  ];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [5, 10, 20],
    domLayout: 'autoHeight',
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
    },
    theme: themeAlpine,
    context: {
      reloadData: this.getRowData.bind(this),
    },
    getRowClass: (params) => {
      if (params.node.rowPinned) {
        return 'pinned-total-row';
      }
      return '';
    },
    rowClassRules: {
      'negative-balance': (params) => { return params.data.left < 0; },
      'positive-balance': (params) => { return params.data.left >= 0; },
    }
  };

  private gridApi!: GridApi;

  colDefs!: ColDef[];
  rowData!: ROW_DATA_STRUCTURE[];

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    this.setupComponent();
  }

  setupComponent() {
    if (this.pageSize) {
      this.gridOptions.paginationPageSize = this.pageSize;
    }

    this.getRowData();

    this.colDefs = [
      { field: "category_type", headerName: "Type", flex: 1 },
      { field: "name", headerName: "Category", flex: 1.5 },
      { field: "amount", headerName: "Limit", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1, comparator: (value1, value2) => numComparator(value1, value2, this.currencySymbol)  },
      { field: "spent", headerName: "Amount Spent", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1, comparator: (value1, value2) => numComparator(value1, value2, this.currencySymbol) },
      { field: "left", headerName: "Amount Left", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1, comparator: (value1, value2) => numComparator(value1, value2, this.currencySymbol), sort: "asc" },
    ]
  }

  getRowData() {
    this.getBudget().subscribe(budget => {
      const populateBudget = budget.map(async (row) => {
        const amountSpent = await firstValueFrom(this.getSpentAmount(row.name));
        const spent = Number(amountSpent) || 0;
        const left = (row.amount || 0) - spent;
  
        return {
          ...row,
          spent,
          left: left.toFixed(2),
        };
      });
      Promise.all(populateBudget).then(budget => {
        this.rowData = budget;
  
        this.calculateTotal();
      });
    });
  }

  onFilterTextBoxChanged() {
    if (this.gridApi) {
      const filterText = (document.getElementById('search') as HTMLInputElement).value;
      this.gridApi.setGridOption(
        "quickFilterText",
        filterText,
      );
    } else {
      console.warn('Grid API not ready yet!');
    }
  }

  getBudget(): Observable<ROW_DATA_STRUCTURE[]> {
    return this.queryService.getBudget(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving budget', error);
        return of([]);
      })
    );
  }

  getSpentAmount(category: string): Observable<number> {
    return this.queryService.getSpentAmount(this.userID, category).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error retrieving the spent amount for category '${category}'`, error);
        return of(0);
      })
    );
  }

  calculateTotal() {
    const budgetTotal = this.rowData.reduce((sum, row) => {
      const amount = Number(row.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalSpent = this.rowData.reduce((sum, row) => {
      const amount = Number(row.spent);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalLeft = this.rowData.reduce((sum, row) => {
      const amount = Number(row.left);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    this.total = [
      {
        name: "Total:",
        amount: budgetTotal.toFixed(2),
        spent: totalSpent.toFixed(2),
        left: totalLeft.toFixed(2),
      },
    ];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
