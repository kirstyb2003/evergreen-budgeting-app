import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaySavingsGoalsComponent } from './display-savings-goals.component';

describe('DisplaySavingsGoalsComponent', () => {
  let component: DisplaySavingsGoalsComponent;
  let fixture: ComponentFixture<DisplaySavingsGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplaySavingsGoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaySavingsGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
