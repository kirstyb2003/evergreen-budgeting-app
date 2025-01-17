import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.scss'
})
export class BudgetPageComponent {

}
