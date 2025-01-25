import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AgCharts } from "ag-charts-angular";
import { AgChartOptions } from "ag-charts-community";

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, AgCharts],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input({ required: true }) currentUser!: number;
  @Input({ required: true }) timePeriod!: "weekly" | "monthly" | "yearly";

  transType: string = "Income";

  transTypeControl = new FormControl('income');

  options: AgChartOptions;

  constructor() {
    this.options = {
      data: [
        { category: "Bills", amount: 60000 },
        { category: "Entertainment", amount: 40000 },
        { category: "Cash", amount: 7000 },
        { category: "Real Estate", amount: 5000 },
        { category: "Commodities", amount: 3000 },
      ],
      series: [
        {
          type: "pie",
          angleKey: "amount",
          legendItemKey: "category",
        },
      ],
    };
  }

  ngOnInit(): void {
    this.transTypeControl.valueChanges.subscribe((val) => {
      console.log('Dropdown value changed:', val);
      this.transType = val!.charAt(0).toUpperCase() + val!.slice(1);

      if (this.transType === "Expense") {
        this.transType += "s";
      }
    });
  }
}
