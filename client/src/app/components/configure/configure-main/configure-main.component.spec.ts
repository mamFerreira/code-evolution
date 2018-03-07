import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMainComponent } from './configure-main.component';

describe('ConfigureMainComponent', () => {
  let component: ConfigureMainComponent;
  let fixture: ComponentFixture<ConfigureMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
