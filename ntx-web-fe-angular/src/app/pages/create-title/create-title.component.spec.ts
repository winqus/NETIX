import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTitleComponent } from './create-title.component';

describe('CreateTitleComponent', () => {
  let component: CreateTitleComponent;
  let fixture: ComponentFixture<CreateTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTitleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
