// interface SeriesInfo {
//   seriesId: string;
//   seriesTitle: string;
//   seasons: SeasonInfo[];
// }

// interface SeasonInfo {
//   seasonId: string;
//   seasonNumber: number;
//   episodeNumber: number;
// }

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  duration: number; // Duration in seconds
  creator: {
    id: string;
    name: string;
  };
  thumbnails: {
    default: string;
    medium?: string;
    high?: string;
  };
  tags: string[];
  categories: string[];
  publishedAt: Date;
  updatedAt?: Date;
  // statistics: {
  //   viewCount: number;
  //   commentCount: number;
  // };
  // status: {
  //   privacyStatus: 'public' | 'unlisted' | 'private';
  //   publishStatus: 'published' | 'draft' | 'scheduled';
  //   contentRating: string[];
  // };
  // contentDetails: {
  //   definition: 'sd' | 'hd' | 'fullhd' | '4k' | '8k';
  //   aspectRatio: '16:9' | '4:3' | 'other';
  //   captionsAvailable: boolean;
  // };
  // playbackDetails: {
  //   hlsUrl?: string;
  //   dashUrl?: string;
  // };
  // series?: SeriesInfo[]; // Optional property to accommodate videos not part of any series
}
