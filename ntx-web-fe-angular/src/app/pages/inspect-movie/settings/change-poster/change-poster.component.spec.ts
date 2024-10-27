import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePosterComponent } from './change-poster.component';

describe('ChangePosterComponent', () => {
  let component: ChangePosterComponent;
  let fixture: ComponentFixture<ChangePosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePosterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
