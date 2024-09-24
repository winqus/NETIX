import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTitleComponent } from './import-title.component';

describe('ImportTitleComponent', () => {
  let component: ImportTitleComponent;
  let fixture: ComponentFixture<ImportTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportTitleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
