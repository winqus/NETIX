import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { formatTime } from '@ntx/app/shared/services/utils/utils';

@Component({
  selector: 'app-timeline',
  standalone: true,
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnDestroy {
  @ViewChild('timeline', { static: true }) videoTimeline!: ElementRef<HTMLElement>;
  @ViewChild('thumbTooltip', { static: false }) thumbTooltip!: ElementRef<HTMLElement>;

  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  @Input() bufferEndTime: number = 0;
  @Output() currentTimeChange = new EventEmitter<number>();

  isDragging = false;
  isInTimeline = false;

  tooltipPosition: number = 0;

  newTime: number = 0;
  previewPosition: string = '0%';
  progressPosition: string = '0%';

  private mouseUpListener!: () => void;
  private mouseMoveListener!: () => void;

  constructor(private readonly renderer: Renderer2) {}

  ngOnDestroy(): void {
    this.removeMouseListeners();
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.updateTimelinePosition(event);
    this.addMouseListeners();
  }

  onMouseEnter(): void {
    this.isInTimeline = true;
    this.addMouseMoveListener();
  }

  onMouseLeave(): void {
    this.isInTimeline = false;
    this.removeMouseMoveListener();
  }

  mediaProgress(): string {
    if (this.isDragging && this.currentTime != this.newTime) {
      this.currentTime = this.newTime;
    }

    return this.calculatePercentage(this.currentTime, this.duration);
  }

  previewBufferedProgress(): string {
    if (this.isDragging || !this.duration) {
      return '0%';
    }
    const duration = this.duration;
    const progressTime = this.isInTimeline ? this.newTime : this.bufferEndTime;

    return this.calculatePercentage(progressTime, duration);
  }

  updateTimelinePosition(event: MouseEvent): void {
    const clientX = event.clientX;
    const rect = this.videoTimeline.nativeElement.getBoundingClientRect();
    const toolTipRect = this.thumbTooltip.nativeElement.getBoundingClientRect();

    const newProgress = ((clientX - rect.left) * 100) / rect.width;
    const clampedProgress = Math.max(0, Math.min(100, newProgress));

    this.newTime = (clampedProgress * this.duration) / 100;
    this.tooltipPosition = this.calculateTooltipPosition(clientX, rect, toolTipRect);
  }

  getTooltipLabel(): string {
    return formatTime(this.newTime, true);
  }

  private addMouseMoveListener(): void {
    if (!this.mouseMoveListener) {
      this.mouseMoveListener = this.renderer.listen(this.videoTimeline.nativeElement, 'mousemove', this.updateTimelinePosition.bind(this));
    }
  }

  private removeMouseMoveListener(): void {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
      this.mouseMoveListener = undefined!;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.updateTimelinePosition(event);
      this.currentTimeChange.emit(this.currentTime);
      this.removeMouseListeners();
    }
  }

  private calculatePercentage(time: number, duration: number): string {
    if (duration === 0) return '0%';

    const percentage = (time / duration) * 100;
    return `${percentage.toFixed(3)}%`;
  }

  private calculateTooltipPosition(clientX: number, rect: DOMRect, toolTipRect: DOMRect): number {
    const halfTooltipWidth = toolTipRect.width / 2;
    const minPosition = rect.left;
    const maxPosition = rect.left + rect.width - toolTipRect.width;

    let tooltipPosition = clientX - halfTooltipWidth;
    tooltipPosition = Math.max(minPosition, Math.min(maxPosition, tooltipPosition));

    return tooltipPosition;
  }

  private addMouseListeners(): void {
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
  }

  private removeMouseListeners(): void {
    if (this.mouseUpListener) {
      this.mouseUpListener();
    }
  }
}
