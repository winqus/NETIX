import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { getSearchByIdUrl, getSearchByTitleUrl } from '@ntx-shared/config/api-endpoints';
import MetadataDTO from '@ntx-shared/models/metadata.dto';
import { MetadataDTOMapper } from '@ntx-shared/mappers/metadataMapper';
import { IMetadataService } from './IMetadata.interface';

@Injectable({
  providedIn: 'root',
})
export class MetadataService implements IMetadataService {
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
