import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieChartComponent } from './pie-chart.component';
import { QueryService } from '../services/query.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgPieSeriesTooltipRendererParams } from "ag-charts-community";

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;
  let queryServiceMock: any;

  beforeEach(async () => {
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
    };

    await TestBed.configureTestingModule({
      imports: [PieChartComponent, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, BrowserAnimationsModule],
      providers: [{ provide: QueryService, useValue: queryServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    component.userID = '123';
    component.currencySymbol = '£';
    component.timePeriod = 'weekly';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise chart options correctly', () => {
    expect(component.options).toBeDefined();
    expect(component.options.series![0].type).toBe('pie');
  });

  it('should call getWeeklyCats when timePeriod is weekly', () => {
    component.timePeriod = 'weekly';
    component.getChartData();
    expect(queryServiceMock.getWeeklyCats).toHaveBeenCalledWith('income', '123');
  });

  it('should handle errors when getWeeklyCats fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getWeeklyCats.and.returnValue(throwError(() => new Error('Server error')));
    component.getChartData();
    expect(console.error).toHaveBeenCalledWith('Error retrieving weekly transactions', jasmine.any(Error));
  });

  it('should update chart title on transaction type change', () => {
    component.transTypeControl.setValue('expense');
    fixture.detectChanges();
    expect(component.transType).toBe('Expenses');
    expect(component.options.title!.text).toBe('Your Weekly Expenses');
  });

  it('should call getMonthlyCats when timePeriod is monthly', () => {
    component.timePeriod = 'monthly';
    component.getChartData();
    expect(queryServiceMock.getMonthlyCats).toHaveBeenCalledWith('income', '123');
  });

  it('should handle errors when getMonthlyCats fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getMonthlyCats.and.returnValue(throwError(() => new Error('Server error')));
    component.timePeriod = 'monthly';
    component.getChartData();
    expect(console.error).toHaveBeenCalledWith('Error retrieving monthly transactions', jasmine.any(Error));
  });

  it('should call getYearlyCats when timePeriod is yearly', () => {
    component.timePeriod = 'yearly';
    component.getChartData();
    expect(queryServiceMock.getYearlyCats).toHaveBeenCalledWith('income', '123');
  });

  it('should handle errors when getYearlyCats fails', () => {
    spyOn(console, 'error');
    queryServiceMock.getYearlyCats.and.returnValue(throwError(() => new Error('Server error')));
    component.timePeriod = 'yearly';
    component.getChartData();
    expect(console.error).toHaveBeenCalledWith('Error retrieving yearly transactions', jasmine.any(Error));
  });

  it('should update chart data correctly', () => {
    const testData = [{ category: 'Entertainment', amount: 200 }, { category: 'Bills', amount: 150 }];
    component.updateChartData(testData);
    expect(component.options.data).toEqual(testData);
  });

  it('should update chart title correctly', () => {
    component.timePeriod = 'yearly';
    component.transType = 'Savings';
    component.updateChartTitle();
    expect(component.options.title!.text).toBe('Your Yearly Savings');
  });

  it('should update values when timePeriod changes to weekly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'weekly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('weekly');
    expect(component.options.title!.text).toBe('Your Weekly Income');
    expect(queryServiceMock.getWeeklyCats).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to monthly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'monthly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('monthly');
    expect(component.options.title!.text).toBe('Your Monthly Income');
    expect(queryServiceMock.getMonthlyCats).toHaveBeenCalled();
  });

  it('should update values when timePeriod changes to yearly', () => {
    component.ngOnChanges({ timePeriod: { currentValue: 'yearly', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.timePeriod).toBe('yearly');
    expect(component.options.title!.text).toBe('Your Yearly Income');
    expect(queryServiceMock.getYearlyCats).toHaveBeenCalled();
  });

  it('should render tooltip correctly with formatted value', () => {
    const mockParams = {
      datum: { category: 'Food', amount: 150.456 },
      legendItemKey: 'category',
      angleKey: 'amount'
    } as AgPieSeriesTooltipRendererParams<any>;
  
    component.currencySymbol = '£';
    const result = component.renderer(mockParams);
  
    expect(result.data).toEqual([{ label: 'Food', value: '£150.46' },]);
  });
});