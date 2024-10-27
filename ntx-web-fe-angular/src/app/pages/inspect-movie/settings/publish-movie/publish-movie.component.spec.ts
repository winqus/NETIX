import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishMovieComponent } from './publish-movie.component';

describe('PublishMovieComponent', () => {
  let component: PublishMovieComponent;
  let fixture: ComponentFixture<PublishMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishMovieComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublishMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
