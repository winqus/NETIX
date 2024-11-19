import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineComponent } from './timeline.component';
import { ElementRef, Renderer2 } from '@angular/core';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    mockRenderer = jasmine.createSpyObj('Renderer2', ['listen']);

    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [{ provide: Renderer2, useValue: mockRenderer }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;

    component.videoTimeline = new ElementRef(document.createElement('div'));
    component.thumbTooltip = new ElementRef(document.createElement('div'));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onMouseDown', () => {
    it('should set isDragging to true and call updateTimelinePosition', () => {
      spyOn(component, 'updateTimelinePosition');

      const event = new MouseEvent('mousedown');
      component.onMouseDown(event);

      expect(component.isDragging).toBeTrue();
      expect(component.updateTimelinePosition).toHaveBeenCalledWith(event);
    });
  });

  describe('updateTimelinePosition', () => {
    it('should calculate new timeline position and tooltip position', () => {
      const event = new MouseEvent('mousemove', { clientX: 50 });

      const timelineRect = { left: 0, width: 100 } as DOMRect;
      const tooltipRect = { width: 20 } as DOMRect;

      spyOn(component.videoTimeline.nativeElement, 'getBoundingClientRect').and.returnValue(timelineRect);
      spyOn(component.thumbTooltip.nativeElement, 'getBoundingClientRect').and.returnValue(tooltipRect);

      component.duration = 200;
      component.updateTimelinePosition(event);

      expect(component.newTime).toBe(100);
      expect(component.tooltipPosition).toBe(40);
    });
  });

  describe('mediaProgress', () => {
    it('should return correct percentage when dragging', () => {
      component.isDragging = true;
      component.newTime = 50;
      component.duration = 200;

      const progress = component.mediaProgress();

      expect(progress).toBe('25.000%');
    });

    it('should handle duration of 0 gracefully', () => {
      component.isDragging = true;
      component.currentTime = 50;
      component.duration = 0;

      const progress = component.mediaProgress();

      expect(progress).toBe('0%');
    });
  });

  describe('previewBufferedProgress', () => {
    it('should return buffered progress percentage', () => {
      component.isDragging = false;
      component.isInTimeline = true;
      component.newTime = 50;
      component.duration = 200;

      const progress = component.previewBufferedProgress();

      expect(progress).toBe('25.000%');
    });

    it('should return 0% if duration is 0', () => {
      component.duration = 0;

      const progress = component.previewBufferedProgress();

      expect(progress).toBe('0%');
    });
  });

  describe('onMouseUp', () => {
    it('should stop dragging and emit currentTimeChange', () => {
      component.isDragging = true;
      component.currentTime = 100;
      spyOn(component.currentTimeChange, 'emit');

      const event = new MouseEvent('mouseup');
      (component as any).onMouseUp(event);

      expect(component.isDragging).toBeFalse();
      expect(component.currentTimeChange.emit).toHaveBeenCalledWith(100);
    });
  });
});
