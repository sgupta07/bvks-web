import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowSearchComponent } from './how-search.component';

describe('HowSearchComponent', () => {
  let component: HowSearchComponent;
  let fixture: ComponentFixture<HowSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HowSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
