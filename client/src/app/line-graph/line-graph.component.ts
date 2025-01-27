import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgCartesianChartOptions } from 'ag-charts-community';
import { QueryService } from '../services/query.service';
import { AgCharts } from 'ag-charts-angular';
import { Observable, map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-line-graph',
  standalone: true,
  imports: [AgCharts],
  templateUrl: './line-graph.component.html',
  styleUrl: './line-graph.component.scss'
})
export class LineGraphComponent implements OnInit, OnChanges {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) timePeriod!: "weekly" | "monthly" | "yearly";
  @Input({ required: true }) currencySymbol!: string;

  options: AgCartesianChartOptions;

  constructor(private queryService: QueryService) {
    this.options = {
      axes: [{
        type: 'category',
        position: 'bottom',
        label: {
          rotation: 0,
        },
        title: {
          text: ''
        }
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params) => {
            return params.value < 0 ? `-${this.currencySymbol}${Number(-params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${this.currencySymbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
      ],
      series: [
        {
          type: 'line',
          xKey: 'time',
          yKey: 'income',
          yName: 'Income',
          marker: {
            size: 5,
          },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'expense',
          yName: 'Expenditure',
          marker: {
            size: 5,
          },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'net',
          yName: 'Net Balance',
          marker: {
            size: 5,
          },
        },]
    };
  }

  ngOnInit(): void {
    this.updateAxisLabel();

    this.getChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.timePeriod = changes['timePeriod'].currentValue;

    this.updateAxisLabel();

    this.getChartData();
  }

  getChartData() {
    if (this.timePeriod === "weekly") {
      this.getWeeklyTimeSeries().subscribe(data => {
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "monthly") {
      this.getMonthlyTimeSeries().subscribe(data => {
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "yearly") {
      this.getYearlyTimeSeries().subscribe(data => {
        this.updateChartData(data);
      });
    }
  }

  getWeeklyTimeSeries(): Observable<{ time_period: string, income: string, expense: string, net: string }[]> {
    return this.queryService.getWeeklyTimeSeries(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving weekly time series', error);
        return of([]);
      })
    );
  }

  getMonthlyTimeSeries(): Observable<{ time_period: string, income: string, expense: string, net: string }[]> {
    return this.queryService.getMonthlyTimeSeries(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving monthly time series', error);
        return of([]);
      })
    );
  }

  getYearlyTimeSeries(): Observable<{ time_period: string, income: string, expense: string, net: string }[]> {
    return this.queryService.getYearlyTimeSeries(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving yearly time series', error);
        return of([]);
      })
    );
  }

  updateChartData(data: { time_period: string, income: string, expense: string, net: string }[]) {
    const formattedData = data.map(item => ({
      time: item.time_period,
      income: parseFloat(item.income),
      expense: parseFloat(item.expense),
      net: parseFloat(item.net),
    }));

    this.options = {
      ...this.options,
      data: formattedData,
    };
  }

  updateAxisLabel() {
    let xAxisLabel = '';
    switch (this.timePeriod) {
      case 'weekly':
        xAxisLabel = 'Days of the Week';
        break;
      case 'monthly':
        xAxisLabel = 'Week Starting Dates';
        break;
      case 'yearly':
        xAxisLabel = 'Months';
        break;
    }

    this.options = {
      ...this.options,
      axes: this.options.axes!.map((axis) =>
        axis.position === 'bottom'
          ? {
              ...axis,
              title: { text: xAxisLabel },
            }
          : axis
      ),
    }
  }

}
