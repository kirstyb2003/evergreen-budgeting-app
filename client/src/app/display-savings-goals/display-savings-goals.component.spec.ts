import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { DisplaySavingsGoalsComponent } from './display-savings-goals.component';
import { QueryService } from '../services/query.service';

describe('DisplaySavingsGoalsComponent', () => {
  let component: DisplaySavingsGoalsComponent;
  let fixture: ComponentFixture<DisplaySavingsGoalsComponent>;
  let queryServiceMock: any;
  let snackBarMock: any;
  let dialogMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      getSavingsGoals: jasmine.createSpy('getSavingsGoals').and.returnValue(of([
        { goal_id: 1, name: 'Car', goal_amount: 1000, starting_savings: 200, goal_due_date: '2025-12-31', ranking: 1 },
        { goal_id: 2, name: 'Holiday', goal_amount: 2000, starting_savings: 500, goal_due_date: '2026-06-30', ranking: 2 }
      ])),
      updateGoalsRanking: jasmine.createSpy('updateGoalsRanking').and.returnValue(of({ success: true })),
      deleteSavingsGoal: jasmine.createSpy('deleteSavingsGoal').and.returnValue(of({ success: true }))
    };

    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogMock = jasmine.createSpyObj('MatDialogModule', ['open']);

    await TestBed.configureTestingModule({
      imports: [DisplaySavingsGoalsComponent],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialogModule, useValue: dialogMock },
        provideRouter([])
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaySavingsGoalsComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.amountSaved = 1000;
    component.currencySymbol = '$';
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load savings goals on initialisation', () => {
    expect(queryServiceMock.getSavingsGoals).toHaveBeenCalledWith('123');
    expect(component.savingsGoals.length).toBe(2);
    expect(component.savingsGoals[0].name).toBe('Car');
  });

  it('should handle error when fetching savings goals fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getSavingsGoals.and.returnValue(throwError(() => new Error('Server error')));

    component.setupGoals();
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error retrieving savings goals', jasmine.any(Error));
    expect(component.savingsGoals.length).toBe(0);
  });

  it('should reorder savings goals when dropped', () => {
    const event: CdkDragDrop<string[]> = {
      previousIndex: 1,
      currentIndex: 0,
      item: {} as any,
      container: {} as any,
      previousContainer: {} as any,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
      event: new MouseEvent('drop')
    };

    component.drop(event);
    fixture.detectChanges();

    expect(component.savingsGoals[0].name).toBe('Holiday');
    expect(component.savingsGoals[1].name).toBe('Car');
  });

  it('should call updateGoalsRanking when rankings are updated', () => {
    component.touched = true;
    component.onRankingUpdate();

    expect(queryServiceMock.updateGoalsRanking).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Goals ordering succeessfully saved.', 'Close', { duration: 3000 });
  });

  it('should show message when ranking is not touched', () => {
    snackBarMock.open = jasmine.createSpy('open');
    
    component.touched = false;
    
    component.onRankingUpdate();
    
    expect(snackBarMock.open).toHaveBeenCalledWith('Please reorder your goals before submitting.', 'Close', { duration: 3000 });
  });

  it('should show error message if updateGoalsRanking fails', () => {
    spyOn(console, 'error');
    queryServiceMock.updateGoalsRanking.and.returnValue(throwError(() => new Error('Update failed')));

    component.touched = true;
    component.onRankingUpdate();

    expect(console.error).toHaveBeenCalledWith('Error saving goals ordering', jasmine.any(Error));
    expect(snackBarMock.open).toHaveBeenCalledWith('Error saving goals ordering. Please try again.', 'Close', { duration: 3000 });
  });

  it('should remove savings goal when called', async () => {
    component.savingsGoals = [
      { goal_id: 1, name: 'Car', goal_amount: 1000, starting_savings: 200, goal_due_date: '2025-12-31', ranking: 1 },
      { goal_id: 2, name: 'Holiday', goal_amount: 2000, starting_savings: 500, goal_due_date: '2026-06-30', ranking: 2 }
    ];
  
    queryServiceMock.deleteSavingsGoal.and.callFake((goalId: number) => {
      component.savingsGoals = component.savingsGoals.filter(goal => goal.goal_id !== goalId);
      return of({ success: true });
    });
    
    queryServiceMock.getSavingsGoals.and.callFake(() => {
      return of(component.savingsGoals);
    });
  
    component.removeSavingsGoal(1);
    fixture.detectChanges();
  
    expect(queryServiceMock.deleteSavingsGoal).toHaveBeenCalledWith(1, "123");
    expect(queryServiceMock.getSavingsGoals).toHaveBeenCalled();
  
    expect(component.savingsGoals.length).toBe(1);
    expect(component.savingsGoals[0].name).toBe('Holiday');
  });
  

  it('should handle error when deleting a savings goal fails', () => {
    spyOn(console, 'error');
    queryServiceMock.deleteSavingsGoal.and.returnValue(throwError(() => new Error('Server error')));

    component.removeSavingsGoal(1);
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error deleting savings goal.', jasmine.any(Error));
    expect(component.savingsGoals.length).toBe(2);
  });


  it('should format money correctly', () => {
    expect(component.formatMoney(1000)).toBe('$1,000.00');
    expect(component.formatMoney(-1000)).toBe('-$1,000.00');
  });

  it('should calculate totals correctly', () => {
    component.savingsGoals = [
      { goal_id: 1, name: 'Car', goal_amount: 1000, starting_savings: 200, goal_due_date: '2025-12-31', ranking: 1 },
      { goal_id: 2, name: 'Holiday', goal_amount: 2000, starting_savings: 500, goal_due_date: '2026-06-30', ranking: 2 }
    ];
    component.amountSaved = 1000;

    component.calculateTotals();

    expect(component.savingsGoals[0].currently_saved).toBe(1000);
    expect(component.savingsGoals[1].currently_saved).toBe(700);
  });
});
