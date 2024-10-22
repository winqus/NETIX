import { BackdropSize, PosterSize } from '../images.types';

export function makePosterFileName(posterID: string, size: PosterSize, extention?: string) {
  let name = `${posterID}-${size}`;

  if (extention) {
    name += `.${extention}`;
  }

  return name;
}

export function makeBackdropFileName(backdropID: string, size: BackdropSize, extention?: string) {
  let name = `${backdropID}-${size}`;

  if (extention) {
    name += `.${extention}`;
  }

  return name;
}
