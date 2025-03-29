import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavingsAreaComponent } from './savings-area.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryService } from '../services/query.service';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

describe('SavingsAreaComponent', () => {
  let component: SavingsAreaComponent;
  let fixture: ComponentFixture<SavingsAreaComponent>;

  let queryServiceMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    queryServiceMock = {
      getTotal: jasmine.createSpy('getTotal').and.returnValue(of(500.00)),
      getTotalGoalAmount: jasmine.createSpy('getTotalGoalAmount').and.returnValue(of({ total_goal: 1000.00, total_starting: 100.00 })),
    };

    snackBarMock = {
      open: jasmine.createSpy('open'),
    };

    await TestBed.configureTestingModule({
      imports: [
        MatProgressBarModule,
        MatButtonModule,
        MatTooltipModule,
        MatIcon,
        RouterLink,
        SavingsAreaComponent,
      ],
      providers: [
        { provide: QueryService, useValue: queryServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        provideRouter([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsAreaComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = '£';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call setupGoals on initialisation', () => {
      spyOn(component, 'setupGoals');
      component.ngOnInit();
      expect(component.setupGoals).toHaveBeenCalled();
    });
  });

  describe('setupGoals', () => {
    beforeEach(() => {
      component.currently_saved = 0;
      component.goal_amount = 0;
    });  

    it('should initialise the currently_saved amount correctly', () => {
      component.setupGoals();
      fixture.whenStable();
      expect(component.currently_saved).toBe(600);
      expect(component.goal_amount).toBe(1000);
    });

    it('should handle errors when getting savings', () => {
      queryServiceMock.getTotal.and.returnValue(throwError(() => new Error('Error fetching savings')));
      component.setupGoals();
      fixture.whenStable();
      expect(component.currently_saved).toBe(100.00);
    });

    it('should handle errors when getting goal amount', () => {
      queryServiceMock.getTotalGoalAmount.and.returnValue(throwError(() => new Error('Error fetching goal amount')));
      component.setupGoals();
      expect(component.goal_amount).toBe(0);
    });
  });

  describe('getTotalSaved', () => {
    it('should return the total savings as an observable', (done) => {
      component.getTotalSaved().subscribe((total: any) => {
        expect(total).toBe(500);
        done();
      });
    });

    it('should return 0 when an error occurs while getting savings', (done) => {
      queryServiceMock.getTotal.and.returnValue(throwError(() => new Error('Error')));
      component.getTotalSaved().subscribe((total: any) => {
        expect(total).toBe(0);
        done();
      });
    });
  });

  describe('getTotalGoal', () => {
    it('should return the total goal and starting amount as an observable', (done) => {
      component.getTotalGoal().subscribe((goal: any) => {
        expect(goal).toEqual({ total_goal: 1000.00, total_starting: 100.00 });
        done();
      });
    });

    it('should return default goal object when an error occurs', (done) => {
      queryServiceMock.getTotalGoalAmount.and.returnValue(throwError(() => new Error('Error')));
      component.getTotalGoal().subscribe((goal: any) => {
        expect(goal).toEqual({ total_goal: 0.00, total_starting: 0.00 });
        done();
      });
    });
  });

  describe('formatMoney', () => {
    it('should format positive amounts correctly', () => {
      expect(component.formatMoney(1234.56)).toBe('£1,234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(component.formatMoney(-1234.56)).toBe('-£1,234.56');
    });

    it('should handle zero correctly', () => {
      expect(component.formatMoney(0)).toBe('£0.00');
    });
  });

  describe('UI Elements', () => {
    it('should display the correct progress percentage', () => {
      component.currently_saved = 500;
      component.goal_amount = 1000;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.target').textContent).toContain('50% of £1,000.00');
    });

    it('should display the correct amount left to save', () => {
      component.currently_saved = 600;
      component.goal_amount = 1000;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.left').textContent).toContain('£400.00 to go');
    });

    it('should display the correct amount saved', () => {
      component.currently_saved = 600;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.saved').textContent).toContain('£600.00 saved');
    });
  });
});
