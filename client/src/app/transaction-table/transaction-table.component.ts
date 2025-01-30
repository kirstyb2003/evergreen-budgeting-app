import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent, IDateFilterParams, SortDirection } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { TableActionComponent } from '../table-action/table-action.component';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

ModuleRegistry.registerModules([AllCommunityModule]);

type ROW_DATA_STRUCTURE = {
  name: string,
  category: string,
  amount: number,
  transaction_date: string,
  shop?: string,
  payment_type?: string
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatMoney(moneyString: string, currencySymbol: string): string {
  const amount = parseFloat(moneyString);

  if (isNaN(amount)) return `${currencySymbol}0.00`;

  const formattedAmount = Math.abs(amount).toFixed(2);

  return amount < 0 ? `-${currencySymbol}${formattedAmount}` : `${currencySymbol}${formattedAmount}`;
}

const filterParams: IDateFilterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    const dateAsString = formatDate(cellValue);
    if (dateAsString == null) return -1;
    const dateParts = dateAsString.split("/");
    const cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0]),
    );

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
  inRangeFloatingFilterDateFormat: "Do MMM YYYY",
};

export function numComparator(num1: string, num2: string, currencySymbol: string) {
  const n1 = reverseFormatMoney(num1, currencySymbol);
  const n2 = reverseFormatMoney(num2, currencySymbol);

  if (isNaN(n1) && isNaN(n2)) {
    return 0;
  }
  if (isNaN(n1)) {
    return -1;
  }
  if (isNaN(n2)) {
    return 1;
  }

  return n1 - n2;
}

export function reverseFormatMoney(formattedMoney: string, currencySymbol: string): number {
  if (!formattedMoney) return NaN;

  const cleanString = formattedMoney.replace(currencySymbol, "").replace(",", "").trim();

  const amount = parseFloat(cleanString);

  return isNaN(amount) ? NaN : amount;
}


@Component({
  selector: 'app-transaction-table',
  imports: [AgGridAngular, NgIf, RouterLink, MatIconModule, MatButtonModule, MatTooltip],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss'
})
export class TransactionTableComponent implements OnInit, OnChanges {
  @Input({ required: true }) timeFrame: string = '';
  @Input({ required: true }) transactionType: string = '';
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) currencySymbol!: string;
  @Input() pageSize?: number;
  @Input({ required: true }) currentUrl!: string;

  title: string = '';
  dateOrder: SortDirection = 'asc';

  total: any[] = [
    {
      actions: "Total:",
      amount: 0.00
    },
  ];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [5, 10, 20, 50, 100],
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
    }
  };

  private gridApi!: GridApi;

  colDefs!: ColDef[];
  rowData!: ROW_DATA_STRUCTURE[];

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    this.setupComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.transactionType = changes['transactionType'].currentValue;

    this.setupComponent();
  }

  setupComponent() {
    if (this.transactionType == 'expense') {
      this.title = this.timeFrame + ' expenses';
    } else {
      this.title = this.timeFrame + " " + this.transactionType;
    }

    if (this.pageSize) {
      this.gridOptions.paginationPageSize = this.pageSize;
    }

    this.getRowData();

    this.colDefs = [
      {
        headerName: "",
        field: "actions",
        cellRenderer: TableActionComponent,
        sortable: false,
        filter: false,
        width: 150,
      },
      { field: "name" },
      { field: "category" },
      { field: "amount", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol), comparator: (value1, value2) => numComparator(value1, value2, this.currencySymbol) },
      { field: "transaction_date", headerName: "Transaction Date", valueFormatter: (params) => formatDate(params.value), sort: this.dateOrder, filter: 'agDateColumnFilter', filterParams: filterParams },
      { field: "shop" },
      { field: "payment_method", headerName: "Payment Method" },

    ]
  }

  getRowData() {
    if (this.timeFrame == "past") {
      this.dateOrder = "desc";
      this.getPastTransactions().subscribe(transactions => {
        this.rowData = transactions;

        this.calculateTotal();
      });
    } else {
      this.getUpcomingTransactions().subscribe(transactions => {
        this.rowData = transactions;

        this.calculateTotal();
      });
    }
  }

  onFilterTextBoxChanged() {
    if (this.gridApi) {
      const filterText = (document.getElementById(this.timeFrame + "-" + this.transactionType) as HTMLInputElement).value;
      this.gridApi.setGridOption(
        "quickFilterText",
        filterText,
      );
    } else {
      console.warn('Grid API not ready yet!');
    }
  }

  getPastTransactions(): Observable<ROW_DATA_STRUCTURE[]> {
    return this.queryService.getPastTransactions(this.transactionType, this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving past transactions', error);
        return of([]);
      })
    );
  }

  getUpcomingTransactions(): Observable<ROW_DATA_STRUCTURE[]> {
    return this.queryService.getUpcomingTransactions(this.transactionType, this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving upcoming transactions', error);
        return of([]);
      })
    );
  }

  calculateTotal() {
    const totalAmount = this.rowData.reduce((sum, row) => {
      const amount = Number(row.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    this.total = [
      {
        actions: "Total:",
        amount: totalAmount.toFixed(2),
      },
    ];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
