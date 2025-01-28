import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AgCharts } from "ag-charts-angular";
import { AgChartOptions, AgChartTheme } from "ag-charts-community";
import { catchError, map, Observable, of } from 'rxjs';
import { QueryService } from '../services/query.service';

var chartTheme: AgChartTheme = {
  palette: {
    fills: ["#014700", "#0077B6", "#6A0572", "#00AF7F", "#0096C7", "#9B5DE5", "#7EC636", "#023E8A", "#8338EC", "#26E9B7", "#4361EE", "#C77DFF", "#B6E483", "#3A0CA3"],
    strokes: ["black"],
  },
};

@Component({
    selector: 'app-pie-chart',
    imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, AgCharts],
    templateUrl: './pie-chart.component.html',
    styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnInit, OnChanges {
  @Input({ required: true }) userID!: string;
  @Input({ required: true }) timePeriod!: "weekly" | "monthly" | "yearly";
  @Input({ required: true }) currencySymbol!: string;

  transType: string = "Income";

  transTypeControl = new FormControl('income');

  options: AgChartOptions;

  constructor(private queryService: QueryService) {
    this.options = {
      theme: chartTheme,
      series: [
        {
          type: "pie",
          angleKey: "amount",
          legendItemKey: "category",
        },
      ],
      overlays: {
        noData: {
          text: "No data for this time period"
        },
        unsupportedBrowser: {
          text: ""
        }
      }
    };
  }

  ngOnInit(): void {
    this.updateChartTitle();
    this.getChartData();

    this.transTypeControl.valueChanges.subscribe((val) => {
      this.transType = val!.charAt(0).toUpperCase() + val!.slice(1);

      if (this.transType === "Expense") {
        this.transType += "s";
      }

      this.getChartData();
      this.updateChartTitle();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.timePeriod = changes['timePeriod'].currentValue;

    this.getChartData();
    this.updateChartTitle();
  }

  getChartData() {
    if (this.timePeriod === "weekly") {
      this.getWeeklyCats().subscribe(data => {
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "monthly") {
      this.getMonthlyCats().subscribe(data => {
        this.updateChartData(data);
      });
    } else if (this.timePeriod === "yearly") {
      this.getYearlyCats().subscribe(data => {
        this.updateChartData(data);
      });
    }
  }

  getWeeklyCats(): Observable<{ category: string, amount: number }[]> {
    return this.queryService.getWeeklyCats(this.transTypeControl.value as string, this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving weekly transactions', error);
        return of([]);
      })
    );
  }

  getMonthlyCats(): Observable<{ category: string, amount: number }[]> {
    return this.queryService.getMonthlyCats(this.transTypeControl.value as string, this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving monthly transactions', error);
        return of([]);
      })
    );
  }

  getYearlyCats(): Observable<{ category: string, amount: number }[]> {
    return this.queryService.getYearlyCats(this.transTypeControl.value as string, this.userID).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error retrieving yearly transactions', error);
        return of([]);
      })
    );
  }

  updateChartData(data: { category: string, amount: number }[]) {
    const newOptions = {
      ...this.options,
      data,
    };
    this.options = newOptions;
  }

  updateChartTitle() {
    this.options = {
      ...this.options,
      title: {
        text: `Your ${this.timePeriod.charAt(0).toUpperCase() + this.timePeriod.slice(1)} ${this.transType}`,
      },
    };
  }
}
