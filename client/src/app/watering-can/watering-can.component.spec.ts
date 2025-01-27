import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WateringCanComponent } from './watering-can.component';

describe('WateringCanComponent', () => {
  let component: WateringCanComponent;
  let fixture: ComponentFixture<WateringCanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WateringCanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WateringCanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
