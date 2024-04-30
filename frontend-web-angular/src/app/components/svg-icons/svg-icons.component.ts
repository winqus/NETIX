import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-svg-icons',
  standalone: true,
  imports: [SafeHtmlPipe],
  template: `<div [innerHTML]="currentSvg | safeHtml"></div> `,
  styles: [
    `
      svg {
        display: inline-block;
        vertical-align: middle;
      }
    `,
  ],
})
export class SvgIconsComponent implements OnChanges {
  @Input() name: string = 'default';
  @Input() size: string = '24px'; // Default size
  @Input() color: string = 'currentColor'; // Default color

  currentSvg: string = '';

  icons: { [key: string]: string } = {
    play: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
      </svg>
    `,
    pause: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
      </svg>
    `,
    back: `
      <svg width="size" height="size" fill="currentColor" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs></defs>
        <path fill-rule="evenodd" d="M 9.224,1.553 A 0.5,0.49999973 0 0 1 9.447,2.2229996 L 6.56,7.9999965 9.448,13.775994 a 0.5,0.49999973 0 1 1 -0.894,0.447999 l -3,-5.9999965 a 0.5,0.49999973 0 0 1 0,-0.4479999 l 3,-5.9999968 A 0.5,0.49999973 0 0 1 9.224,1.553" 
        style="stroke-width: 1.5; paint-order: stroke fill markers; stroke: currentColor; stroke-opacity: 1; stroke-miterlimit: 4; stroke-dasharray: none"></path>
      </svg>
    `,
    volume0: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
      </svg>
    `,
    volume1: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z" />
        <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/>
      </svg>
    `,
    volume05: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>
      </svg>
    `,
    volume025: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.717 3.55A.5.5 0 0 1 11 4v8a.5.5 0 0 1-.812.39L7.825 10.5H5.5A.5.5 0 0 1 5 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06" />
      </svg>
    `,
    fastBackward: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696z" />
        <path d="M.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696z" />
      </svg>
    `,
    fastForward: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696z" />
        <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696z" />
      </svg>
    `,
    pictureInPicture: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/>
        <path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z" />
      </svg>
    `,
    enterFullscreen: `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="fill-white" viewBox="0 0 16 16">
        <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/>
      </svg>
    `,
    exitFullscreen: `
      <svg xmlns="http://www.w3.org/2000/svg" width="size" height="size" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/>
      </svg>
    `,
    default: `
      <div class="bg-[red] text-white">ERROR</div>
    `,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) {
      this.updateSvg();
    }
  }

  updateSvg(): void {
    this.currentSvg = this.icons[this.name] || this.icons['default'];
    this.currentSvg = this.currentSvg.replaceAll('size', `${this.size}`).replaceAll('currentColor', `${this.color}`);
  }
}
