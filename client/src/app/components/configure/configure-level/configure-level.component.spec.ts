import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureLevelComponent } from './configure-level.component';

describe('ConfigureLevelComponent', () => {
  let component: ConfigureLevelComponent;
  let fixture: ComponentFixture<ConfigureLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
