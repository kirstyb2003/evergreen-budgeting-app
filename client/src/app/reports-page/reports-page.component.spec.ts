import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsPageComponent } from './reports-page.component';
import { AuthenticationService } from '../services/authentication.service';
import { QueryService } from '../services/query.service';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { currencyMap } from '../data-structures/currency-codes';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { LineGraphComponent } from '../line-graph/line-graph.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ReportsPageComponent', () => {
  let component: ReportsPageComponent;
  let fixture: ComponentFixture<ReportsPageComponent>;
  let authServiceMock: any;
  let queryServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: of({ user_id: '123', default_currency: 'USD' }),
      isLoggedIn: jasmine.createSpy("isLoggedIn").and.returnValue(of(true))
    };

    queryServiceMock = {
      getWeeklyCats: jasmine.createSpy('getWeeklyCats').and.returnValue(of([
        { category: 'Food', amount: 100 },
        { category: 'Rent', amount: 500 },
      ])),
      getMonthlyCats: jasmine.createSpy('getMonthlyCats').and.returnValue(of([
        { category: 'Groceries', amount: 300 },
        { category: 'Utilities', amount: 150 },
      ])),
      getYearlyCats: jasmine.createSpy('getYearlyCats').and.returnValue(of([
        { category: 'Salary', amount: 50000 },
        { category: 'Investments', amount: 10000 },
      ])),
      getWeeklyTimeSeries: jasmine.createSpy('getWeeklyTimeSeries').and.returnValue(of([
        { time_period: 'Mar 22', income: '30', expense: '15', net: '15' },
        { time_period: 'Mar 23', income: '0', expense: '20', net: '-20' },
      ])),
      getMonthlyTimeSeries: jasmine.createSpy('getMonthlyTimeSeries').and.returnValue(of([
        { time_period: 'Feb 24', income: '450', expense: '130', net: '320' },
        { time_period: 'Mar 03', income: '30', expense: '90', net: '-60' },
      ])),
      getYearlyTimeSeries: jasmine.createSpy('getYearlyTimeSeries').and.returnValue(of([
        { time_period: 'Apr 2024', income: '1250', expense: '1130', net: '0120' },
        { time_period: 'May 2024', income: '978', expense: '1340', net: '-362' },
      ])),
      getWeeklyExpenses: jasmine.createSpy('getWeeklyExpenses').and.returnValue(of([
        { time_period: 'Mar 21', total: '24' },
        { time_period: 'Mar 22', total: '12.45' },
      ])),
      getMonthlyExpenses: jasmine.createSpy('getMonthlyExpenses').and.returnValue(of([
        { time_period: 'Feb 24', total: '120' },
        { time_period: 'Mar 03', total: '100' },
      ])),
      getYearlyExpenses: jasmine.createSpy('getYearlyExpenses').and.returnValue(of([
        { time_period: 'Apr 2024', total: '1200' },
        { time_period: 'May 2024', total: '1123.23' },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, ReportsPageComponent, PieChartComponent, LineGraphComponent, BarChartComponent, NavBarComponent, BrowserAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: QueryService, useValue: queryServiceMock },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentUser and currencySymbol on init', () => {
    expect(component.currentUser).toEqual({ user_id: '123', default_currency: 'USD' });
    expect(component.currencySymbol).toEqual(currencyMap['USD'].symbol);
  });

  it('should update timePeriod when timePeriodControl value changes', () => {
    component.timePeriodControl.setValue('weekly');
    expect(component.timePeriod).toBe('weekly');
  });
});
