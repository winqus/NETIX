import { Injectable } from '@angular/core';
import { getSearchByIdUrl, getSearchByTitleUrl } from '../../config/metadata.config';
import { HttpClient } from '@angular/common/http';
import MetadataDTO from '../../models/metadata.dto';
import { MetadataDTOMapper } from '../../mappers/metadataMapper';
import { map, Observable } from 'rxjs';
import { IMetadataSearch } from './IMetadataSearch.service';

@Injectable({
  providedIn: 'root',
})
export class MetadataSearch implements IMetadataSearch {
  constructor(private http: HttpClient) {}

  getDataFromTitle(search: string): Observable<MetadataDTO[]> {
    const url = getSearchByTitleUrl(search);
    const httpOptions = {};

    return this.http.get<MetadataDTO[]>(url, httpOptions).pipe(map((item) => MetadataDTOMapper.toMetadataItemList(item)));
  }

  getDataFromId(id: string, type: string, source: string): Observable<MetadataDTO> {
    const url = getSearchByIdUrl(id, type, source);
    const httpOptions = {};

    return this.http.get<MetadataDTO>(url, httpOptions).pipe(map((item) => MetadataDTOMapper.toMetadataItem(item)));
  }
}
