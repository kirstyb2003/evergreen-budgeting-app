import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgCartesianChartOptions, AgChartTheme } from 'ag-charts-community';
import { QueryService } from '../services/query.service';
import { AgCharts } from 'ag-charts-angular';
import { Observable, map, catchError, of } from 'rxjs';

var chartTheme: AgChartTheme = {
  palette: {
    fills: ["#7EC636"],
    strokes: ["black"],
  },
};

@Component({
    selector: 'app-bar-chart',
    imports: [AgCharts],
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) timePeriod!: "weekly" | "monthly" | "yearly";
  @Input({ required: true }) currencySymbol!: string;

  options: AgCartesianChartOptions;

  constructor(private queryService: QueryService) {
    this.options = {
      theme: chartTheme,
      axes: [{
        type: 'category',
        position: 'bottom',
        label: {
          rotation: 0,
        },
        title: {
          text: "Week Start Dates"
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
      series: [{ type: 'bar', xKey: 'time', yKey: 'total' },]
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
      this.getWeeklyExpenses().subscribe(data => {
        console.log(data);
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "monthly") {
      this.getMonthlyExpenses().subscribe(data => {
        console.log(data);
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "yearly") {
      this.getYearlyExpenses().subscribe(data => {
        console.log(data);
        this.updateChartData(data);
      });
    }
  }

  getWeeklyExpenses(): Observable<{ time_period: string, total: string }[]> {
    return this.queryService.getWeeklyExpenses(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving weekly expenses', error);
        return of([]);
      })
    );
  }

  getMonthlyExpenses(): Observable<{ time_period: string, total: string }[]> {
    return this.queryService.getMonthlyExpenses(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving monthly expenses', error);
        return of([]);
      })
    );
  }

  getYearlyExpenses(): Observable<{ time_period: string, total: string }[]> {
    return this.queryService.getYearlyExpenses(this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving yearly expenses', error);
        return of([]);
      })
    );
  }

  updateChartData(data: { time_period: string, total: string }[]) {
    const formattedData = data.map(item => ({
      time: item.time_period,
      total: parseFloat(item.total)
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
        xAxisLabel = 'Month Names';
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

