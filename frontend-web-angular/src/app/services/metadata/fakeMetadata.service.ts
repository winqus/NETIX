import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IMetadata } from './IMetadata.service';
import MetadataDTO from '../../models/metadata.dto';
import { MetadataDTOMapper } from '../../mappers/metadataMapper';

@Injectable({
  providedIn: 'root',
})
export class FakeMetadata implements IMetadata {
  constructor(private http: HttpClient) {}

  getDataFromTitle(_search: string): Observable<MetadataDTO[]> {
    const data = [
      {
        id: '800',
        title: 'Shrek the Third',
        originalTitle: 'Shrek the Third',
        type: 'MOVIE',
        releaseDate: new Date('2007-05-17T00:00:00.000Z'),
        sourceUUID: 'TMDB_SEARCH_V3',
        details: {
          runtime: 90,
        },
      },
      {
        id: '801',
        title: 'Shrek',
        originalTitle: 'Shrek',
        type: 'MOVIE',
        releaseDate: new Date('2002-01-01T00:00:00.000Z'),
        sourceUUID: 'TMDB_SEARCH_V3',
        details: {
          runtime: 93,
        },
      },
    ];
    return of(MetadataDTOMapper.toMetadataItemList(data));
  }

  getDataFromId(id: string, type: string, source: string): Observable<MetadataDTO> {
    const data = {
      id: id,
      title: 'Shrek the Third',
      originalTitle: 'Shrek the Third',
      type: type,
      releaseDate: new Date('2007-05-17T00:00:00.000Z'),
      sourceUUID: source,
      details: {
        runtime: 90,
      },
    };
    return of(MetadataDTOMapper.toMetadataItem(data));
  }
}
