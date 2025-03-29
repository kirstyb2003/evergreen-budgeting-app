import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthenticationService } from '../services/authentication.service';
import { currencyMap } from '../data-structures/currency-codes';
import { PieChartComponent } from "../pie-chart/pie-chart.component";
import { LineGraphComponent } from "../line-graph/line-graph.component";
import { BarChartComponent } from "../bar-chart/bar-chart.component";

export type time_period = "weekly" | "monthly" | "yearly";

@Component({
    selector: 'app-reports-page',
    imports: [NavBarComponent, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, PieChartComponent, LineGraphComponent, BarChartComponent],
    templateUrl: './reports-page.component.html',
    styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent implements OnInit {

  timePeriodControl = new FormControl('monthly');
  timePeriod: time_period = 'monthly';
  currentUser!: any;
  currencySymbol!: string;

  constructor(private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      let currency = this.currentUser.default_currency;
      this.currencySymbol = currencyMap[currency].symbol;
    });

    this.timePeriodControl.valueChanges.subscribe((val) => {
      this.timePeriod = val! as time_period;
    });
  }
}
