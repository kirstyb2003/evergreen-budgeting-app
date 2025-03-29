import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetSavingsGoalPageComponent } from './set-savings-goal-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import moment from 'moment';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SetSavingsGoalPageComponent', () => {
  let component: SetSavingsGoalPageComponent;
  let fixture: ComponentFixture<SetSavingsGoalPageComponent>;
  
  let authServiceMock: any;
  let queryServiceMock: any;
  let snackBarMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: '12345' }),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    queryServiceMock = {
      getSavingsGoal: jasmine.createSpy('getSavingsGoal').and.returnValue(of({
        name: 'Vacation',
        goal_amount: 5000,
        goal_due_date: '2025-12-31',
        starting_savings: 1000
      })),
      updateSavingsGoal: jasmine.createSpy('updateSavingsGoal').and.returnValue(of({})),
      setSavingsGoal: jasmine.createSpy('setSavingsGoal').and.returnValue(of({}))
    };

    snackBarMock = {
      open: jasmine.createSpy('open')
    };

    activatedRouteMock = {
      paramMap: of(new Map([['id', '123']])),
      queryParams: of({ prev: '/' })
    };

    await TestBed.configureTestingModule({
      imports: [SetSavingsGoalPageComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: QueryService, useValue: queryServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetSavingsGoalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialise form with default values', () => {
      expect(component.savingsForm).toBeTruthy();
      expect(component.savingsForm.value).toEqual({
        name: '',
        target_amount: '',
        goal_date: '',
        starting_amount: '0'
      });
    });

    it('should fetch and set goal data if goalID exists', () => {
      component.ngOnInit();
      component.goalID = "1";
      component.fetchGoal();

      expect(queryServiceMock.getSavingsGoal).toHaveBeenCalledWith('1');
      expect(component.savingsForm.value).toEqual({
        name: 'Vacation',
        target_amount: 5000,
        goal_date: moment('2025-12-31').toDate(),
        starting_amount: 1000
      });
    });
  });

  describe('onSubmit', () => {
    it('should mark form as touched if invalid', () => {
      spyOn(component.savingsForm, 'markAllAsTouched');

      component.onSubmit();

      expect(component.savingsForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should submit new savings goal if no goalID exists', () => {
      component.goalID = null;
      component.savingsForm.setValue({
        name: 'Emergency Fund',
        target_amount: '3000',
        goal_date: moment('2025-06-01').toDate(),
        starting_amount: '500'
      });

      component.onSubmit();

      expect(queryServiceMock.setSavingsGoal).toHaveBeenCalledWith({
        name: 'Emergency Fund',
        target_amount: '3000',
        goal_date: '2025-06-01',
        starting_amount: '500'
      }, '12345');

      expect(snackBarMock.open).toHaveBeenCalledWith('Savings goal successfully saved.', 'Close', { duration: 3000 });
    });

    it('should update savings goal if goalID exists', () => {
      component.goalID = '123';
      component.savingsForm.setValue({
        name: 'Updated Goal',
        target_amount: '7000',
        goal_date: moment('2025-09-30').toDate(),
        starting_amount: '1500'
      });

      component.onSubmit();

      expect(queryServiceMock.updateSavingsGoal).toHaveBeenCalledWith('123', {
        name: 'Updated Goal',
        target_amount: '7000',
        goal_date: '2025-09-30',
        starting_amount: '1500'
      });

      expect(snackBarMock.open).toHaveBeenCalledWith('Savings goal successfully updated.', 'Close', { duration: 3000 });
    });

    it('should handle error when saving a new goal fails', () => {
      queryServiceMock.setSavingsGoal.and.returnValue(throwError(() => new Error('Server error')));

      component.goalID = null;
      component.savingsForm.setValue({
        name: 'Failed Goal',
        target_amount: '4000',
        goal_date: moment('2026-01-01').toDate(),
        starting_amount: '200'
      });

      component.onSubmit();

      expect(snackBarMock.open).toHaveBeenCalledWith('Error saving goal. Please try again.', 'Close', { duration: 3000 });
    });

    it('should handle error when updating an existing goal fails', () => {
      queryServiceMock.updateSavingsGoal.and.returnValue(throwError(() => new Error('Server error')));

      component.goalID = '123';
      component.savingsForm.setValue({
        name: 'Failed Update',
        target_amount: '5000',
        goal_date: moment('2025-12-01').toDate(),
        starting_amount: '1000'
      });

      component.onSubmit();

      expect(snackBarMock.open).toHaveBeenCalledWith('Error updating goal. Please try again.', 'Close', { duration: 3000 });
    });

    it('should set goal_date to null if no date is provided', () => {
      component.goalID = null;
      component.savingsForm.setValue({
        name: 'No Date Goal',
        target_amount: '2000',
        goal_date: '',
        starting_amount: '500'
      });
    
      component.onSubmit();
    
      expect(queryServiceMock.setSavingsGoal).toHaveBeenCalledWith({
        name: 'No Date Goal',
        target_amount: '2000',
        goal_date: null,
        starting_amount: '500'
      }, '12345');
    }); 
  });

  describe('Form Controls', () => {
    it('should validate required fields', () => {
      component.savingsForm.setValue({
        name: '',
        target_amount: '',
        goal_date: '',
        starting_amount: ''
      });

      expect(component.name.valid).toBeFalse();
      expect(component.target_amount.valid).toBeFalse();
      expect(component.starting_amount.valid).toBeFalse();
    });

    it('should allow goal_date to be optional', () => {
      component.savingsForm.setValue({
        name: 'Vacation Fund',
        target_amount: '1000',
        goal_date: '',
        starting_amount: '100'
      });

      expect(component.goal_date.valid).toBeTrue();
    });
  }); 
});
