import { Title } from '@ntx/titles-legacy/interfaces/title.interface';

export interface MovieTitle extends Title {
  runtimeMinutes: number;
  video?: { uuid: string };
}
