import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WateringCanComponent } from './watering-can.component';
import { CurrencyPipe, NgClass, NgIf } from '@angular/common';

describe('WateringCanComponent', () => {
  let component: WateringCanComponent;
  let fixture: ComponentFixture<WateringCanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WateringCanComponent, CurrencyPipe, NgClass, NgIf],
    }).compileComponents();

    fixture = TestBed.createComponent(WateringCanComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate waterY correctly when within budget', () => {
    component.spent = 50;
    component.budget = 100;
    fixture.detectChanges();
    expect(component.waterY).toBe(component.baseY - (0.5 * component.maxHeight));
  });

  it('should calculate waterY correctly over budget', () => {
    component.spent = 200;
    component.budget = 100;
    fixture.detectChanges();
    expect(component.waterY).toBe(209);
  });

  it('should calculate waterHeight correctly when within budget', () => {
    component.spent = 50;
    component.budget = 100;
    fixture.detectChanges();
    expect(component.waterHeight).toBe(0.5 * component.maxHeight);
  });

  it('should calculate waterHeight correctly when over budget', () => {
    component.spent = 200;
    component.budget = 100;
    fixture.detectChanges();
    expect(component.waterHeight).toBe(component.maxHeight);
  });

  it('should set textX correctly', () => {
    expect(component.textX).toBe(203 + (208 / 2));
  });

  it('should calculate textY correctly when spent is within budget', () => {
    component.spent = 50;
    component.budget = 100;
    fixture.detectChanges();
    let expectedY = component.baseY - (component.waterHeight / 2) + 20;
    if (expectedY > 455) expectedY = 455;
    expect(component.textY).toBe(expectedY);
  });

  it('should capitalise transaction type correctly', () => {
    component.type = 'groceries';
    fixture.detectChanges();
    expect(component.transType).toBe('Groceries');
  });

  it('should apply correct class when spent is within budget', () => {
    component.spent = 50;
    component.budget = 100;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.watering-can-area');
    expect(element.classList.contains('within-budget')).toBeTrue();
  });

  it('should apply correct class when spent is over budget', () => {
    component.spent = 150;
    component.budget = 100;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.watering-can-area');
    expect(element.classList.contains('over-budget')).toBeTrue();
  });
});
