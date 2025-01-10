import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent, IDateFilterParams, SortDirection } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';
import { TableActionComponent } from '../table-action/table-action.component';

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

function formatMoney(moneyString: string, currencySymbol: string): string {
  if (!moneyString) return currencySymbol + '0.00';

  return currencySymbol + moneyString;
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


@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss'
})
export class TransactionTableComponent implements OnInit {
  @Input({ required: true }) timeFrame: string = '';
  @Input({ required: true }) transactionType: string = '';
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) currencySymbol!: string;

  title: string = '';
  dateOrder: SortDirection = 'asc';

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 20,
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
    }
  };

  private gridApi!: GridApi;

  colDefs!: ColDef[];
  rowData!: ROW_DATA_STRUCTURE[];

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    if (this.transactionType == 'expense') {
      this.title = this.timeFrame + ' expenses';
    } else {
      this.title = this.timeFrame + " " + this.transactionType;
    }

    this.getRowData();

    this.colDefs = [
      {
        headerName: "",
        cellRenderer: TableActionComponent,
        sortable: false,
        filter: false,
        width: 150,
      },
      { field: "name" },
      { field: "category" },
      { field: "amount", valueFormatter: (params) => formatMoney(params.value, this.currencySymbol) },
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
      });
    } else {
      this.getUpcomingTransactions().subscribe(transactions => {
        this.rowData = transactions;
      });
    }
  }

  onFilterTextBoxChanged() {
    if (this.gridApi) {
      const filterText = (document.getElementById(this.timeFrame) as HTMLInputElement).value;
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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
