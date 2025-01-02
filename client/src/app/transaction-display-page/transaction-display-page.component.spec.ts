import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDisplayPageComponent } from './transaction-display-page.component';

describe('TransactionDisplayPageComponent', () => {
  let component: TransactionDisplayPageComponent;
  let fixture: ComponentFixture<TransactionDisplayPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDisplayPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionDisplayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
