import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTextItemComponent } from './search-text-item.component';

describe('SearchTextItemComponent', () => {
  let component: SearchTextItemComponent;
  let fixture: ComponentFixture<SearchTextItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchTextItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTextItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
