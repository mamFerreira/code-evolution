import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureGoalComponent } from './configure-goal.component';

describe('ConfigureGoalComponent', () => {
  let component: ConfigureGoalComponent;
  let fixture: ComponentFixture<ConfigureGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
