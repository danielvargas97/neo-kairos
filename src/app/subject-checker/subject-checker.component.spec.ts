import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectCheckerComponent } from './subject-checker.component';

describe('SubjectCheckerComponent', () => {
  let component: SubjectCheckerComponent;
  let fixture: ComponentFixture<SubjectCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectCheckerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
