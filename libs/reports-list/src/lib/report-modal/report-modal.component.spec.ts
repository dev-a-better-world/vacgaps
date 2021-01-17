import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ReportModalComponent } from './report-modal.component';

describe('ReportModalComponent', () => {
  let component: ReportModalComponent;
  let fixture: ComponentFixture<ReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      imports: [MatDialogModule],
      declarations: [ ReportModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
