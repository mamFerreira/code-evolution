import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureLearningComponent } from './configure-learning.component';

describe('ConfigureLearningComponent', () => {
  let component: ConfigureLearningComponent;
  let fixture: ComponentFixture<ConfigureLearningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureLearningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
