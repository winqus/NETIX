import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectMovieComponent } from './inspect-movie.component';

describe('InspectMovieComponent', () => {
  let component: InspectMovieComponent;
  let fixture: ComponentFixture<InspectMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectMovieComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
