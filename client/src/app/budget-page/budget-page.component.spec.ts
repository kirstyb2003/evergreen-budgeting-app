import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPageComponent } from './budget-page.component';

describe('SettingsPageComponent', () => {
  let component: BudgetPageComponent;
  let fixture: ComponentFixture<BudgetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
