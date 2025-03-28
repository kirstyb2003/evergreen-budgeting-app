import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { QueryService } from '../services/query.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('BarChartComponent', () => {
  let component: BarChartComponent;
  let fixture: ComponentFixture<BarChartComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
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
      imports: [BarChartComponent],
      providers: [{ provide: QueryService, useValue: queryServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = '£';
    component.timePeriod = 'weekly';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getWeeklyExpenses when timePeriod is weekly', () => {
    component.timePeriod = 'weekly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getWeeklyExpenses).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Mar 21', total: 24 },
      { time: 'Mar 22', total: 12.45 },
    ]);
  });

  it('should call getMonthlyExpenses when timePeriod is monthly', () => {
    component.timePeriod = 'monthly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getMonthlyExpenses).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Feb 24', total: 120 },
      { time: 'Mar 03', total: 100 },
    ]);
  });

  it('should call getYearlyExpenses when timePeriod is yearly', () => {
    component.timePeriod = 'yearly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getYearlyExpenses).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Apr 2024', total: 1200 },
      { time: 'May 2024', total: 1123.23 },
    ]);
  });

  it('should handle errors when getWeeklyExpenses fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getWeeklyExpenses.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'weekly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving weekly expenses', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should handle errors when getMonthlyExpenses fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getMonthlyExpenses.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'monthly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving monthly expenses', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should handle errors when getYearlyExpenses fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getYearlyExpenses.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'yearly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving yearly expenses', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should update axis label correctly based on timePeriod', () => {
    component.timePeriod = 'weekly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title?.text).toBe('Days of the Week');

    component.timePeriod = 'monthly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title?.text).toBe('Week Starting Dates');

    component.timePeriod = 'yearly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title?.text).toBe('Month Names');
  });

  it('should update values when timePeriod changes to weekly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'weekly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('weekly');
    expect(component.options.axes![0].title?.text).toBe('Days of the Week');
    expect(queryServiceMock.getWeeklyExpenses).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to monthly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'monthly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('monthly');
    expect(component.options.axes![0].title?.text).toBe('Week Starting Dates');
    expect(queryServiceMock.getMonthlyExpenses).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to yearly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'yearly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('yearly');
    expect(component.options.axes![0].title?.text).toBe('Month Names');
    expect(queryServiceMock.getYearlyExpenses).toHaveBeenCalled();
  });

  it('should correctly format axis labels with currency symbol (GBP)', () => {
    component.currencySymbol = '£';

    const numberAxis = component.options.axes!.find(axis => axis.position === 'left');
    expect(numberAxis).toBeDefined();

    const formatter = numberAxis!.label!.formatter!;

    expect(formatter({ value: 100, index: 0 })).toBe('£100.00');
    expect(formatter({ value: -50, index: 0 })).toBe('-£50.00');
    expect(formatter({ value: 0, index: 0 })).toBe('£0.00');
  });

  it('should correctly format axis labels with currency symbol (ERN)', () => {
    component.currencySymbol = 'Nfk';

    const numberAxis = component.options.axes!.find(axis => axis.position === 'left');
    expect(numberAxis).toBeDefined();

    const formatter = numberAxis!.label!.formatter!;

    expect(formatter({ value: 100, index: 0 })).toBe('Nfk100.00');
    expect(formatter({ value: -50, index: 0 })).toBe('-Nfk50.00');
    expect(formatter({ value: 0, index: 0 })).toBe('Nfk0.00');
  });

  it('should initialise chart options correctly', () => {
    expect(component.options.theme).toBeDefined();
    expect(component.options.series).toEqual([{ type: 'bar', xKey: 'time', yKey: 'total' }]);
  });

  it('should update chart data correctly', () => {
    const testData = [
      { time_period: 'Jan 01', total: '200' },
      { time_period: 'Jan 02', total: '-50' },
    ];

    component.updateChartData(testData);

    expect(component.options.data).toEqual([
      { time: 'Jan 01', total: 200 },
      { time: 'Jan 02', total: -50 },
    ]);
  });
});
