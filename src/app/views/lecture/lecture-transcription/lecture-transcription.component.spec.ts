import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureTranscriptionComponent } from './lecture-transcription.component';

describe('LectureTranscriptionComponent', () => {
  let component: LectureTranscriptionComponent;
  let fixture: ComponentFixture<LectureTranscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LectureTranscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LectureTranscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
