import { Component, Input, OnChanges } from '@angular/core';
import { Status } from '@ntx/app/components/shared/enum/upload-status.enum';
import { SvgIconsComponent } from '@ntx/app/components/shared/components/svg-icons/svg-icons.component';

export interface UploadStatusProps {
  imageUploading?: Status;
  videoUploading?: Status;
}

@Component({
  selector: 'app-upload-status',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './upload-status.component.html',
})
export class UploadStatusComponent implements OnChanges {
  @Input() props: UploadStatusProps = {};

  defaultProps: UploadStatusProps = {
    imageUploading: Status.uploading,
    videoUploading: Status.uploading,
  };

  ngOnChanges(): void {
    this.props = { ...this.defaultProps, ...this.props };
  }

  getIconNameFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'throbber',
        [Status.completed]: 'check_circle',
        [Status.failed]: 'x_circle',
      }[status] || ''
    );
  }

  getColorFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'white',
        [Status.completed]: 'green',
        [Status.failed]: 'red',
      }[status] || 'white'
    );
  }

  getTextFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'is being uploaded...',
        [Status.completed]: 'upload is completed.',
        [Status.failed]: 'upload failed.',
      }[status] || ''
    );
  }
}
