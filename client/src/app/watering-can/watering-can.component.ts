import { Component, Input } from '@angular/core';
import { formatMoney } from '../transaction-table/transaction-table.component';
import { CurrencyPipe, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-watering-can',
    imports: [CurrencyPipe, NgClass, NgIf],
    templateUrl: './watering-can.component.html',
    styleUrl: './watering-can.component.scss'
})
export class WateringCanComponent {
  @Input({ required: true }) spent: number = 0;
  @Input({ required: true }) budget: number = 0;
  @Input({ required: true }) name: string = '';
  @Input({ required: true }) type: string = '';
  @Input({ required: true }) currencySymbol: string = "";

  formatMoney = formatMoney;

  baseY: number = 459;
  maxHeight: number = 250;

  get waterY(): number {
    const filledRatio = this.budget === 0 ? 0 : this.spent / this.budget;
    let y: number;

    if (this.spent > this.budget) {
      y = 209;
    } else {
      y = this.baseY - (filledRatio * this.maxHeight);
    }

    return y;
  }

  get waterHeight(): number {
    let height: number;

    if (this.spent > this.budget) {
      height = this.maxHeight;
    } else {
      height = this.budget === 0 ? 0 : (this.spent / this.budget) * this.maxHeight;
    }

    return height;
  }

  get textX() {
    return 203 + (208 / 2);
  }

  get textY() {
    let y_coord = this.baseY - (this.waterHeight / 2) + 20;

    if (y_coord > 455) {
      y_coord = 455;
    }
    return y_coord;
  }

  get transType() {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }
}
