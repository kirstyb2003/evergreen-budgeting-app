import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogTransactionPageComponent } from './log-transaction-page.component';

describe('LogTransactionPageComponent', () => {
  let component: LogTransactionPageComponent;
  let fixture: ComponentFixture<LogTransactionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogTransactionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogTransactionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
