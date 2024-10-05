export interface MovieDTO {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  summary: string;
  originallyReleasedAt: Date;
  runtimeMinutes: number;
  posterID: string;
  videoID?: string;
}

export interface UpdateMovieDTO {
  name: string;
  summary: string;
  originallyReleasedAt: Date;
  runtimeMinutes: number;
}
