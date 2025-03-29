import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableActionComponent, DialogDeleteTrans } from './table-action.component';
import { provideRouter, Router } from '@angular/router';
import { QueryService } from '../services/query.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentCommunicationService } from '../services/component-communication.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('TableActionComponent', () => {
  let component: TableActionComponent;
  let fixture: ComponentFixture<TableActionComponent>;
  let queryServiceMock: any;
  let snackBarMock: any;
  let communicationServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      deleteTransaction: jasmine.createSpy('deleteTransaction').and.returnValue(of({})),
    };

    snackBarMock = {
      open: jasmine.createSpy('open'),
    };

    communicationServiceMock = {
      notifyRefresh: jasmine.createSpy('notifyRefresh'),
    };

    await TestBed.configureTestingModule({
      imports: [TableActionComponent, MatButtonModule, MatIcon, MatDialogModule],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ComponentCommunicationService, useValue: communicationServiceMock },
        provideRouter([])
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableActionComponent);
    component = fixture.componentInstance;
    component.agInit({
      data: { transaction_id: 1, type: 'expense', name: 'Groceries', repeat: false, actions: 'Delete', transaction_date: '2025-03-29' },
      context: { reloadData: jasmine.createSpy('reloadData') },
    } as any);
    fixture.detectChanges();
  });

  it('should create TableActionComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise transaction data correctly', () => {
    expect(component.transID).toBe(1);
    expect(component.categoryType).toBe('expense');
    expect(component.name).toBe('Groceries');
    expect(component.repeated).toBeFalse();
    expect(component.actions).toBe('Delete');
    expect(component.date).toBe('2025-03-29');
  });

  it('should call deleteTransaction and handle success', () => {
    component.reloadData = jasmine.createSpy('reloadData');
    component.deleteTransaction(null);

    expect(queryServiceMock.deleteTransaction).toHaveBeenCalledWith(1, null, '2025-03-29');
    expect(snackBarMock.open).toHaveBeenCalledWith('Transaction successfully deleted', 'Close', { duration: 3000 });
    expect(component.reloadData).toHaveBeenCalled();
    expect(communicationServiceMock.notifyRefresh).toHaveBeenCalled();
  });

  it('should handle deleteTransaction error', () => {
    queryServiceMock.deleteTransaction.and.returnValue(throwError(() => new Error('Server error')));
    spyOn(console, 'error');

    component.deleteTransaction(null);

    expect(console.error).toHaveBeenCalledWith('Error deleting transaction.', jasmine.any(Error));
    expect(snackBarMock.open).toHaveBeenCalledWith('Error deleting transaction. Please try again.', 'Close', { duration: 3000 });
  });

  it('should render delete and edit buttons when actions are not "Total:"', () => {
    const deleteButton = fixture.debugElement.query(By.css('.del-edit-buttons[aria-label="Remove Item"]'));
    const editButton = fixture.debugElement.query(By.css('.del-edit-buttons[aria-label="Edit Item"]'));

    expect(deleteButton).toBeTruthy();
    expect(editButton).toBeTruthy();
  });

  it('should display "Total Amount" text when actions is "Total:"', () => {
    component.actions = 'Total:';
    fixture.detectChanges();

    const totalAmountText = fixture.debugElement.query(By.css('div b'));

    expect(totalAmountText).toBeTruthy();
    expect(totalAmountText.nativeElement.textContent).toBe('Total Amount:');
  });
});
