import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideojsMediaViewerComponent } from './videojs-media-viewer.component';

describe('VideojsMediaViewerComponent', () => {
  let component: VideojsMediaViewerComponent;
  let fixture: ComponentFixture<VideojsMediaViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideojsMediaViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideojsMediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
