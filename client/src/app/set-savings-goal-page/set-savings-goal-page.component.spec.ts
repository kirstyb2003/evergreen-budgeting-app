import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetSavingsGoalPageComponent } from './set-savings-goal-page.component';

describe('SetSavingsGoalPageComponent', () => {
  let component: SetSavingsGoalPageComponent;
  let fixture: ComponentFixture<SetSavingsGoalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetSavingsGoalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetSavingsGoalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
