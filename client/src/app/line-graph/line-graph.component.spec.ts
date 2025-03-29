import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineGraphComponent } from './line-graph.component';
import { QueryService } from '../services/query.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LineGraphComponent', () => {
  let component: LineGraphComponent;
  let fixture: ComponentFixture<LineGraphComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
    queryServiceMock = {
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
    };

    await TestBed.configureTestingModule({
      imports: [LineGraphComponent],
      providers: [{ provide: QueryService, useValue: queryServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineGraphComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = '£';
    component.timePeriod = 'weekly';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call the correct service method when timePeriod is weekly', () => {
    component.timePeriod = 'weekly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getWeeklyTimeSeries).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Mar 22', income: 30, expense: 15, net: 15 },
      { time: 'Mar 23', income: 0, expense: 20, net: -20 },
    ]);
  });

  it('should call the correct service method when timePeriod is monthly', () => {
    component.timePeriod = 'monthly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getMonthlyTimeSeries).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Feb 24', income: 450, expense: 130, net: 320 },
      { time: 'Mar 03', income: 30, expense: 90, net: -60 },
    ]);
  });

  it('should call the correct service method when timePeriod is yearly', () => {
    component.timePeriod = 'yearly';
    fixture.detectChanges();
    component.getChartData();

    expect(queryServiceMock.getYearlyTimeSeries).toHaveBeenCalledWith('123');
    expect(component.options.data).toEqual([
      { time: 'Apr 2024', income: 1250, expense: 1130, net: 120 },
      { time: 'May 2024', income: 978, expense: 1340, net: -362 },
    ]);
  });

  it('should handle errors when getWeeklyTimeSeries fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getWeeklyTimeSeries.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'weekly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving weekly time series', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should handle errors when getMonthlyTimeSeries fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getMonthlyTimeSeries.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'monthly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving monthly time series', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should handle errors when getYearlyTimeSeries fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getYearlyTimeSeries.and.returnValue(throwError(() => new Error('Server error')));

    component.timePeriod = 'yearly';
    fixture.detectChanges();
    component.getChartData();

    expect(console.error).toHaveBeenCalledWith('Error retrieving yearly time series', jasmine.any(Error));
    expect(component.options.data).toEqual([]);
  });

  it('should update the chart data correctly', () => {
    const testData = [
      { time_period: 'Mar 22', income: '30', expense: '15', net: '15' },
      { time_period: 'Mar 23', income: '0', expense: '20', net: '-20' },
    ];

    component.updateChartData(testData);

    expect(component.options.data?.length).toBe(2);
    expect(component.options.data![0].time).toBe('Mar 22');
    expect(component.options.data![0].income).toBe(30);
    expect(component.options.data![0].expense).toBe(15);
    expect(component.options.data![0].net).toBe(15);
  });

  it('should update the axis labels based on the time period', () => {
    component.timePeriod = 'weekly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title!.text).toBe('Days of the Week');

    component.timePeriod = 'monthly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title!.text).toBe('Week Starting Dates');

    component.timePeriod = 'yearly';
    component.updateAxisLabel();
    expect(component.options.axes![0].title!.text).toBe('Months');
  });

  it('should render the chart component', () => {
    const chartElement = fixture.debugElement.query(By.css('ag-charts'));
    expect(chartElement).toBeTruthy();
  });

  it('should update values when timePeriod changes to weekly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'weekly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('weekly');
    expect(component.options.axes![0].title?.text).toBe('Days of the Week');
    expect(queryServiceMock.getWeeklyTimeSeries).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to monthly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'monthly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('monthly');
    expect(component.options.axes![0].title?.text).toBe('Week Starting Dates');
    expect(queryServiceMock.getMonthlyTimeSeries).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to yearly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'yearly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('yearly');
    expect(component.options.axes![0].title?.text).toBe('Months');
    expect(queryServiceMock.getYearlyTimeSeries).toHaveBeenCalled();
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

  it('should correctly format axis labels with currency symbol (ETB)', () => {
    component.currencySymbol = 'Br';

    const numberAxis = component.options.axes!.find(axis => axis.position === 'left');
    expect(numberAxis).toBeDefined();

    const formatter = numberAxis!.label!.formatter!;

    expect(formatter({ value: 100, index: 0 })).toBe('Br100.00');
    expect(formatter({ value: -50, index: 0 })).toBe('-Br50.00');
    expect(formatter({ value: 0, index: 0 })).toBe('Br0.00');
  });
});
