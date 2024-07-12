import { Injectable } from '@angular/core';
import { METADATA_CONFIG } from '../config/metadata.config';
import { HttpClient } from '@angular/common/http';
import MetadataDTO from '../models/metadata.dto';
import { MetadataDTOMapper } from '../mappers/metadataMapper';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetadataSearch {
  constructor(private http: HttpClient) {}

  getMovies(search: string): Observable<MetadataDTO[]> {
    const videosUrl = METADATA_CONFIG.baseUrl + METADATA_CONFIG.search;
    const url = `${videosUrl}${search}`;

    const httpOptions = {};

    return this.http.get<MetadataDTO[]>(url, httpOptions).pipe(map((data) => data.map((item) => MetadataDTOMapper.toMetadataItem(item))));
  }
}
