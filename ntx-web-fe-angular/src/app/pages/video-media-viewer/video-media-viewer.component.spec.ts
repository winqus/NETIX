// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { VideoMediaViewerComponent } from './video-media-viewer.component';
// import { ActivatedRoute, Router } from '@angular/router';
// import { LayoutService } from '@ntx-shared/services/layout.service';
// import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
// import videojs from 'video.js';
// import { of } from 'rxjs';
// import { ElementRef } from '@angular/core';
// import { formatTime } from '@ntx/app/shared/services/utils/utils';

// describe('VideoMediaViewerComponent', () => {
//   let component: VideoMediaViewerComponent;
//   let fixture: ComponentFixture<VideoMediaViewerComponent>;
//   let mockActivatedRoute: any;
//   let mockLayoutService: any;
//   let mockRouter: any;
//   let mockPlayer: any;

//   const mockMovieData: MovieDTO = {
//     id: '1',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     name: 'Mock Movie',
//     summary: 'A mock movie summary',
//     originallyReleasedAt: new Date(),
//     runtimeMinutes: 120,
//     posterID: 'poster-id',
//     isPublished: true,
//   };

//   beforeEach(async () => {
//     mockLayoutService = {
//       setIsMobile: jasmine.createSpy('setIsMobile').and.returnValue(false),
//     };

//     mockActivatedRoute = {
//       paramMap: of({ get: () => 'mock-uuid' }),
//     };

//     mockRouter = jasmine.createSpyObj('Router', ['navigate']);

//     const historyMock = {
//       state: { data: mockMovieData },
//       length: 0,
//       scrollRestoration: 'auto',
//       back: jasmine.createSpy(),
//       forward: jasmine.createSpy(),
//       go: jasmine.createSpy(),
//       pushState: jasmine.createSpy(),
//       replaceState: jasmine.createSpy(),
//     } as History;
//     spyOnProperty(window, 'history', 'get').and.returnValue(historyMock);

//     mockPlayer = {
//       currentTime: jasmine.createSpy(),
//       duration: jasmine.createSpy().and.returnValue(100),
//       dispose: jasmine.createSpy(),
//       on: jasmine.createSpy(),
//       play: jasmine.createSpy(),
//       pause: jasmine.createSpy(),
//       paused: jasmine.createSpy().and.returnValue(true),
//       muted: jasmine.createSpy(),
//       volume: jasmine.createSpy(),
//       fullscreen: jasmine.createSpy(),
//       bufferedEnd: jasmine.createSpy().and.returnValue(100),
//     };

//     await TestBed.configureTestingModule({
//       imports: [VideoMediaViewerComponent],
//       providers: [
//         { provide: LayoutService, useValue: mockLayoutService },
//         { provide: ActivatedRoute, useValue: mockActivatedRoute },
//         { provide: Router, useValue: mockRouter },
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(VideoMediaViewerComponent);
//     component = fixture.componentInstance;

//     spyOn(videojs, 'getPlayer').and.returnValue(mockPlayer);
//     component.player = mockPlayer;

//     fixture.detectChanges();
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   describe('ngOnInit', () => {
//     it('should set up player and mobile state', async () => {
//       spyOn(component, 'setupPlayer');
//       await component.ngOnInit();

//       expect(component.setupPlayer).toHaveBeenCalled();
//       expect(component.controlsVisible).toBeTrue();
//     });
//   });

//   describe('setupPlayer', () => {
//     it('should initialize video.js player', () => {
//       component.setupPlayer();
//       expect(component.player).toBeDefined();
//       expect(component.player.on).toHaveBeenCalledWith('timeupdate', jasmine.any(Function));
//     });
//   });

//   describe('togglePlay', () => {
//     it('should play when paused', () => {
//       component.player.paused = jasmine.createSpy().and.returnValue(true);
//       component.togglePlay();
//       expect(component.player.play).toHaveBeenCalled();
//     });

//     it('should pause when playing', () => {
//       component.player.paused = jasmine.createSpy().and.returnValue(false);
//       component.togglePlay();
//       expect(component.player.pause).toHaveBeenCalled();
//     });
//   });

//   describe('changeVolume', () => {
//     it('should change the player volume', () => {
//       const volume = 0.5;
//       component.volume = volume;
//       component.changeVolume();
//       expect(component.player.volume).toHaveBeenCalledWith(volume);
//     });
//   });

//   describe('toggleMute', () => {
//     it('should mute when unmuted', () => {
//       component.player.muted = jasmine.createSpy().and.returnValue(false);
//       component.toggleMute();
//       expect(component.player.muted).toHaveBeenCalledWith(true);
//     });

//     it('should unmute when muted', () => {
//       component.player.muted = jasmine.createSpy().and.returnValue(true);
//       component.toggleMute();
//       expect(component.player.muted).toHaveBeenCalledWith(false);
//     });
//   });

//   describe('toggleFullscreen', () => {
//     beforeEach(() => {
//       spyOn(document, 'exitFullscreen');
//       spyOn(component.fullscreenContainer.nativeElement, 'requestFullscreen');
//     });

//     it('should enter fullscreen if not already in fullscreen', () => {
//       spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);

//       component.toggleFullscreen();
//       expect(component.fullscreenContainer.nativeElement.requestFullscreen).toHaveBeenCalled();
//       expect(component.isInFullscreen).toBeTrue();
//     });

//     it('should exit fullscreen if already in fullscreen', () => {
//       spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(component.fullscreenContainer.nativeElement);
//       component.isInFullscreen = true;

//       component.toggleFullscreen();
//       expect(document.exitFullscreen).toHaveBeenCalled();
//       expect(component.isInFullscreen).toBeFalse();
//     });
//   });

//   describe('onMouseMove', () => {
//     beforeEach(() => {
//       spyOn(component, 'updateTimelinePosition');
//       spyOn<any>(component, 'resetIdleTimer');
//       component['idleTimerSubscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
//     });

//     it('should call updateTimelinePosition and resetIdleTimer', () => {
//       const event = new MouseEvent('mousemove');
//       component.onMouseMove(event);
//       expect(component.updateTimelinePosition).toHaveBeenCalledWith(event);
//       expect(component['resetIdleTimer']).toHaveBeenCalled();
//     });

//     it('should set controlsVisible to true', () => {
//       component.controlsVisible = false;
//       component.onMouseMove(new MouseEvent('mousemove'));
//       expect(component.controlsVisible).toBeTrue();
//     });

//     it('should unsubscribe idleTimerSubscription if it exists', () => {
//       component.onMouseMove(new MouseEvent('mousemove'));
//       expect(component['idleTimerSubscription'].unsubscribe).toHaveBeenCalled();
//     });
//   });

//   describe('hideSlider', () => {
//     it('should set sliderVisible to false if relatedTarget is null', () => {
//       const event = new MouseEvent('mouseleave', { relatedTarget: null });
//       component.sliderVisible = true;
//       component.hideSlider(event);
//       expect(component.sliderVisible).toBeFalse();
//     });

//     it('should not change sliderVisible if relatedTarget has class "slider"', () => {
//       const sliderElement = document.createElement('div');
//       sliderElement.classList.add('slider');
//       const event = new MouseEvent('mouseleave', { relatedTarget: sliderElement });
//       component.sliderVisible = true;
//       component.hideSlider(event);
//       expect(component.sliderVisible).toBeTrue();
//     });
//   });

//   describe('onMouseOut', () => {
//     beforeEach(() => {
//       spyOn(component, 'onMouseUp');
//     });

//     it('should call onMouseUp if mouse leaves window', () => {
//       const event = new MouseEvent('mouseout', { clientX: -10, clientY: 100 });
//       component.onMouseOut(event);
//       expect(component.onMouseUp).toHaveBeenCalledWith(event);
//     });

//     it('should not call onMouseUp if mouse is within window bounds', () => {
//       const event = new MouseEvent('mouseout', { clientX: 100, clientY: 100 });
//       component.onMouseOut(event);
//       expect(component.onMouseUp).not.toHaveBeenCalled();
//     });
//   });

//   describe('onClick and onDoubleClick', () => {
//     beforeEach(() => {
//       jasmine.clock().install();
//       spyOn(component, 'togglePlay');
//       spyOn(component, 'toggleFullscreen');
//     });

//     afterEach(() => {
//       jasmine.clock().uninstall();
//     });

//     it('should toggle play on single click', () => {
//       const event = new MouseEvent('click', { button: 0 });
//       component.onClick(event);
//       jasmine.clock().tick(300);
//       expect(component.togglePlay).toHaveBeenCalled();
//     });

//     it('should toggle fullscreen on double click', () => {
//       const event = new MouseEvent('dblclick', { button: 0 });
//       component.onDoubleClick(event);
//       expect(component.toggleFullscreen).toHaveBeenCalled();
//     });
//   });

//   describe('goBack', () => {
//     it('should call setIsMobile with false and navigate to root', () => {
//       component.goBack();

//       expect(mockLayoutService.setIsMobile).toHaveBeenCalledWith(false);
//       expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
//     });
//   });

//   describe('Timeline interactions for desktop', () => {
//     beforeEach(() => {
//       component.duration = 100;
//       component.videoTimeline = {
//         nativeElement: {
//           getBoundingClientRect: jasmine.createSpy().and.returnValue({
//             left: 10,
//             width: 200,
//           }),
//         },
//       } as ElementRef;

//       component.thumbTooltip = {
//         nativeElement: {
//           getBoundingClientRect: jasmine.createSpy().and.returnValue({
//             width: 20,
//           }),
//         },
//       } as ElementRef;

//       jasmine.createSpy('formatTime').and.returnValue('00:00:00');

//       spyOn<any>(component, 'updateTimelinePosition').and.callThrough();

//       component.duration = 100;
//     });

//     afterEach(() => {
//       if (component.player && typeof component.player.dispose === 'function') {
//         component.player.dispose();
//       }

//       component.isDragging = false;
//       component.isInTimeline = false;
//     });

//     describe('updateTimelinePosition method', () => {
//       it('should set newTime and currentTooltipTime correctly within the 0-100% range', () => {
//         const event = { clientX: 60 } as MouseEvent;

//         component['updateTimelinePosition'](event);

//         const expectedProgress = ((event.clientX - 10) * 100) / 200;
//         const expectedNewTime = (expectedProgress * component.duration) / 100;

//         expect(component.newTime).toBeCloseTo(expectedNewTime);
//         expect(component.currentTooltipTime).toBe(formatTime(expectedNewTime, true));
//       });

//       it('should set tooltipPosition to rect.left when clientX is at the left edge', () => {
//         const event = { clientX: 10 } as MouseEvent;

//         component['updateTimelinePosition'](event);

//         expect(component.tooltipPosition).toBe(10);
//       });

//       it('should set tooltipPosition to right edge when clientX is at the right edge', () => {
//         const event = { clientX: 210 } as MouseEvent;

//         component['updateTimelinePosition'](event);

//         expect(component.tooltipPosition).toBe(190);
//       });

//       it('should set tooltipPosition to centered value when clientX is within bounds', () => {
//         const event = { clientX: 100 } as MouseEvent;

//         component['updateTimelinePosition'](event);

//         expect(component.tooltipPosition).toBe(90);
//       });
//     });

//     describe('onMouseDown', () => {
//       it('should set isDragging to true', () => {
//         const event = new MouseEvent('mousedown');
//         component.isDragging = false;

//         component.onMouseDown(event);

//         expect(component.isDragging).toBeTrue();
//       });

//       it('should call updateTimelinePosition with the MouseEvent argument', () => {
//         const event = new MouseEvent('mousedown');

//         component.onMouseDown(event);

//         expect(component.updateTimelinePosition).toHaveBeenCalledWith(event);
//       });

//       it('should set currentTime to newTime', () => {
//         const event = new MouseEvent('mousedown');
//         component.newTime = 100;

//         component.onMouseDown(event);

//         expect(component.currentTime).toBe(component.newTime);
//       });
//     });

//     describe('onMouseUp', () => {
//       it('should set isDragging to false', () => {
//         const event = new MouseEvent('mouseup');
//         component.isDragging = true;

//         component.onMouseUp(event);

//         expect(component.isDragging).toBeFalse();
//       });

//       it('should call updateTimelinePosition with the MouseEvent argument', () => {
//         const event = new MouseEvent('mouseup');

//         component.onMouseUp(event);

//         expect(component.updateTimelinePosition).toHaveBeenCalledWith(event);
//       });

//       it('should set player currentTime to currentTime', () => {
//         const event = new MouseEvent('mouseup');
//         component.currentTime = 120;

//         component.onMouseUp(event);

//         expect(component.player.currentTime).toHaveBeenCalledWith(120);
//       });
//     });

//     describe('onMouseEnter', () => {
//       it('should set isInTimeline to true', () => {
//         component.isInTimeline = false;

//         component.onMouseEnter();

//         expect(component.isInTimeline).toBeTrue();
//       });
//     });

//     describe('onMouseLeave', () => {
//       it('should set isInTimeline to false', () => {
//         const event = new MouseEvent('mouseleave');
//         component.isInTimeline = true;

//         component.onMouseLeave(event);

//         expect(component.isInTimeline).toBeFalse();
//       });

//       it('should call updateTimelinePosition with the MouseEvent argument', () => {
//         const event = new MouseEvent('mouseleave');

//         component.onMouseLeave(event);

//         expect(component.updateTimelinePosition).toHaveBeenCalledWith(event);
//       });
//     });

//     describe('onTouchStart', () => {
//       it('should set isDragging and isInTimeline to true', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 100,
//           clientY: 100,
//         });
//         const event = new TouchEvent('touchstart', { touches: [touch] });

//         component.onTouchStart(event);

//         expect(component.isDragging).toBeTrue();
//         expect(component.isInTimeline).toBeTrue();
//       });

//       it('should call updateTimelinePosition with the first touch point if touches are present', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 100,
//           clientY: 100,
//         });
//         const event = new TouchEvent('touchstart', { touches: [touch] });

//         component.onTouchStart(event);

//         expect(component['updateTimelinePosition']).toHaveBeenCalledWith(touch);
//       });
//     });

//     describe('onTouchMove', () => {
//       it('should set isDragging and isInTimeline to true', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 150,
//           clientY: 150,
//         });
//         const event = new TouchEvent('touchmove', { touches: [touch] });

//         component.onTouchMove(event);

//         expect(component.isDragging).toBeTrue();
//         expect(component.isInTimeline).toBeTrue();
//       });

//       it('should call updateTimelinePosition with the first touch point if touches are present', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 150,
//           clientY: 150,
//         });
//         const event = new TouchEvent('touchmove', { touches: [touch] });

//         component.onTouchMove(event);

//         expect(component['updateTimelinePosition']).toHaveBeenCalledWith(touch);
//       });
//     });

//     describe('onTouchEnd', () => {
//       it('should set isDragging and isInTimeline to false', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 200,
//           clientY: 200,
//         });
//         const event = new TouchEvent('touchend', { touches: [touch] });

//         component.onTouchEnd(event);

//         expect(component.isDragging).toBeFalse();
//         expect(component.isInTimeline).toBeFalse();
//       });

//       it('should call updateTimelinePosition with the first touch point if touches are present', () => {
//         const touch = new Touch({
//           identifier: 0,
//           target: document.createElement('div'),
//           clientX: 200,
//           clientY: 200,
//         });
//         const event = new TouchEvent('touchend', { touches: [touch] });

//         component.onTouchEnd(event);

//         expect(component['updateTimelinePosition']).toHaveBeenCalledWith(touch);
//       });

//       it('should set player currentTime to currentTime', () => {
//         component.currentTime = 120;
//         const event = new TouchEvent('touchend', { touches: [] });

//         component.onTouchEnd(event);

//         expect(component.player.currentTime).toHaveBeenCalledWith(120);
//       });
//     });
//   });

//   describe('handleKeyboardEvent', () => {
//     beforeEach(() => {
//       spyOn(component, 'togglePlay');
//     });

//     it('should call togglePlay and prevent default action when space key is pressed', () => {
//       const event = new KeyboardEvent('keydown', { key: ' ' });
//       spyOn(event, 'preventDefault');

//       document.dispatchEvent(event);

//       expect(component.togglePlay).toHaveBeenCalled();
//       expect(event.preventDefault).toHaveBeenCalled();
//     });

//     it('should not call togglePlay for keys other than spacebar', () => {
//       const event = new KeyboardEvent('keydown', { key: 'Enter' });
//       spyOn(event, 'preventDefault');

//       document.dispatchEvent(event);

//       expect(component.togglePlay).not.toHaveBeenCalled();
//       expect(event.preventDefault).not.toHaveBeenCalled();
//     });
//   });

//   describe('onTouch', () => {
//     beforeEach(() => {
//       spyOn(component, 'toggleFullscreen');
//       spyOn<any>(component, 'updateTimelinePosition').and.callThrough();
//     });

//     it('should call updateTimelinePosition with the TouchEvent', () => {
//       const touch = new Touch({
//         identifier: 0,
//         target: document.createElement('div'),
//         clientX: 100,
//         clientY: 100,
//       });
//       const event = new TouchEvent('touchstart', { touches: [touch] });

//       component.onTouch(event);

//       expect(component['updateTimelinePosition']).toHaveBeenCalledWith(event);
//     });

//     it('should call toggleFullscreen if touch is within 300ms', () => {
//       const touch = new Touch({
//         identifier: 0,
//         target: document.createElement('div'),
//         clientX: 100,
//         clientY: 100,
//       });
//       const event = new TouchEvent('touchstart', { touches: [touch] });

//       component.lastTouchTime = new Date().getTime() - 200;

//       component.onTouch(event);

//       expect(component.toggleFullscreen).toHaveBeenCalled();
//     });

//     it('should set lastTouchTime if touch is after 300ms', () => {
//       const touch = new Touch({
//         identifier: 0,
//         target: document.createElement('div'),
//         clientX: 100,
//         clientY: 100,
//       });
//       const event = new TouchEvent('touchstart', { touches: [touch] });

//       component.lastTouchTime = new Date().getTime() - 500;

//       component.onTouch(event);

//       expect(component.toggleFullscreen).not.toHaveBeenCalled();
//     });
//   });

//   describe('Playback controls', () => {
//     describe('fastForward', () => {
//       it('should set player.currentTime to currentTime + fastTime if within duration', () => {
//         component.currentTime = 50;
//         component.duration = 100;

//         component.fastForward();

//         expect(component.player.currentTime).toHaveBeenCalledWith(60);
//       });

//       it('should set player.currentTime to duration if currentTime + fastTime exceeds duration', () => {
//         component.currentTime = 95;
//         component.duration = 100;

//         component.fastForward();

//         expect(component.player.currentTime).toHaveBeenCalledWith(100);
//       });
//     });

//     describe('fastBackward', () => {
//       it('should set player.currentTime to currentTime - fastTime if above 0', () => {
//         component.currentTime = 50;

//         component.fastBackward();

//         expect(component.player.currentTime).toHaveBeenCalledWith(40);
//       });

//       it('should set player.currentTime to 0 if currentTime - fastTime goes below 0', () => {
//         component.currentTime = 5;

//         component.fastBackward();

//         expect(component.player.currentTime).toHaveBeenCalledWith(0);
//       });
//     });
//   });
// });
