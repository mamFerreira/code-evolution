import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureEvolutionComponent } from './configure-evolution.component';

describe('ConfigureEvolutionComponent', () => {
  let component: ConfigureEvolutionComponent;
  let fixture: ComponentFixture<ConfigureEvolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureEvolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
