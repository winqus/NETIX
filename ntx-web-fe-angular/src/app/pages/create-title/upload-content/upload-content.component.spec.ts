import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadContentComponent } from './upload-content.component';

describe('UploadContentComponent', () => {
  let component: UploadContentComponent;
  let fixture: ComponentFixture<UploadContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
