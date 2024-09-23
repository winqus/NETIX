import { PosterSize } from '../images.types';

export function makePosterFileName(posterID: string, size: PosterSize, extention?: string) {
  let name = `${posterID}-${size}`;

  if (extention) {
    name += `.${extention}`;
  }

  return name;
}
