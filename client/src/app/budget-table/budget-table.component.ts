import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { formatMoney } from '../transaction-table/transaction-table.component';
import { RouterLink } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

ModuleRegistry.registerModules([AllCommunityModule]);

type ROW_DATA_STRUCTURE = {
  name: string,
  amount: number,
  spent?: number,
  left?: string,
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [AgGridAngular, RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
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
      { field: "name", headerName: "Category", flex: 1.5 },
      { field: "amount", headerName: "Limit", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1  },
      { field: "spent", headerName: "Amount Spent", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1  },
      { field: "left", headerName: "Amount Left", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), flex: 1  },
    ]
  }

  getRowData() {
    this.getBudget().subscribe(budget => {
      console.log(budget)
      this.rowData = budget;

      this.calculateTotal();
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
        console.error('Error retrieving past transactions', error);
        return of([]);
      })
    );
  }

  calculateTotal() {
    const totalAmount = this.rowData.reduce((sum, row) => {
      const amount = Number(row.spent);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    this.total = [
      {
        name: "Total:",
        amount: totalAmount.toFixed(2),
      },
    ];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
