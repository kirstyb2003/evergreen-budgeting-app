import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankBalanceComponent } from './bank-balance.component';

describe('BankBalanceComponent', () => {
  let component: BankBalanceComponent;
  let fixture: ComponentFixture<BankBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
