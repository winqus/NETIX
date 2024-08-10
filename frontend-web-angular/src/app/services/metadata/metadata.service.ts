import { Injectable } from '@angular/core';
import { getSearchByIdUrl, getSearchByTitleUrl } from '@ntx/app/config/api-endpoints';
import { HttpClient } from '@angular/common/http';
import MetadataDTO from '@ntx/app/models/metadata.dto';
import { MetadataDTOMapper } from '@ntx/app/mappers/metadataMapper';
import { map, Observable } from 'rxjs';
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
