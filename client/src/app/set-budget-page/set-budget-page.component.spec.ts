import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetBudgetPageComponent } from './set-budget-page.component';

describe('SetBudgetPageComponent', () => {
  let component: SetBudgetPageComponent;
  let fixture: ComponentFixture<SetBudgetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetBudgetPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetBudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
