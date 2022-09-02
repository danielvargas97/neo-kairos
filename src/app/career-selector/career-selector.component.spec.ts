import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerSelectorComponent } from './career-selector.component';

describe('CareerSelectorComponent', () => {
  let component: CareerSelectorComponent;
  let fixture: ComponentFixture<CareerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CareerSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
