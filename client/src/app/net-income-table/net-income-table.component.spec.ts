import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetIncomeTableComponent } from './net-income-table.component';

describe('NetIncomeTableComponent', () => {
  let component: NetIncomeTableComponent;
  let fixture: ComponentFixture<NetIncomeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetIncomeTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetIncomeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
