import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAreaComponent } from './savings-area.component';

describe('SavingsAreaComponent', () => {
  let component: SavingsAreaComponent;
  let fixture: ComponentFixture<SavingsAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingsAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
