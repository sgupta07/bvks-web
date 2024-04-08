import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTranscriptionCreateComponent } from './admin-transcription-create.component';

describe('AdminTranscriptionCreateComponent', () => {
  let component: AdminTranscriptionCreateComponent;
  let fixture: ComponentFixture<AdminTranscriptionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTranscriptionCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTranscriptionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
