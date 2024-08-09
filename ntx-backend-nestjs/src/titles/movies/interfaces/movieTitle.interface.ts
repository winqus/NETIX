import { Title } from '@ntx/titles/interfaces/title.interface';

export interface MovieTitle extends Title {
  runtimeMinutes: number;
  video?: { uuid: string };
}
