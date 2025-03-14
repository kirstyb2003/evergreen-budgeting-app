import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { QueryService } from '../services/query.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule, NgModel } from '@angular/forms';
import { ComponentCommunicationService } from '../services/component-communication.service';
import { formatDate } from '../transaction-table/transaction-table.component';

@Component({
    selector: 'app-table-action',
    imports: [MatButtonModule, MatIcon, RouterLink, MatDialogModule, NgIf],
    templateUrl: './table-action.component.html',
    styleUrl: './table-action.component.scss'
})
export class TableActionComponent implements ICellRendererAngularComp {
  currentUrl!: String;

  transID!: number;
  categoryType!: string;
  name!: string;
  repeated!: boolean;
  actions!: any;
  date!: string;

  reloadData!: () => void;

  readonly dialog = inject(MatDialog);

  constructor(private router: Router, private queryService: QueryService, private popup: MatSnackBar, private communicationService: ComponentCommunicationService) {
    this.currentUrl = this.router.url;
  }

  agInit(params: ICellRendererParams): void {
    this.transID = params.data.transaction_id;
    this.categoryType = params.data.type;
    this.name = params.data.name;
    this.repeated = params.data.repeat;
    this.actions = params.data.actions;
    this.date = params.data.transaction_date;

    if (params.context && params.context.reloadData) {
      this.reloadData = params.context.reloadData;
    }
  }
  refresh(params: ICellRendererParams) {
    return true;
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(DialogDeleteTrans, {
      data: { name: this.name, title: "Transaction", type: "transaction", buttonText: "Transaction", repeat: this.repeated, date: formatDate(this.date) },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.repeated) {
          this.deleteTransaction(result);
        } else {
          this.deleteTransaction(null)
        }
        
      }
    });
  }

  deleteTransaction(repeatDelete: 'single' | 'all' | 'after' | null) {
    this.queryService.deleteTransaction(this.transID, repeatDelete, this.date).subscribe({
      next: (_response) => {
        this.popup.open('Transaction successfully deleted', 'Close', { duration: 3000 });
        this.reloadData();
        this.communicationService.notifyRefresh();
      },
      error: (err) => {
        console.error('Error deleting transaction.', err);
        this.popup.open('Error deleting transaction. Please try again.', 'Close', { duration: 3000 });
      },
    });
  }
}

@Component({
    selector: 'dialog-delete-transaction',
    templateUrl: '../display-savings-goals/delete-confirmation-dialog.html',
    styleUrl: '../display-savings-goals/delete-confirmation-dialog.scss',
    imports: [MatDialogModule, MatButtonModule, NgIf, MatRadioModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogDeleteTrans {
  selectedOption: 'single' | 'all' | 'after' = 'single';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string, title: string, type: string, buttonText: string, repeat: boolean, date: string }) { }
}



