import { Observable } from 'rxjs';
import MetadataDTO from '../../models/metadata.dto';

export interface IMetadataService {
  getDataFromTitle(search: string): Observable<MetadataDTO[]>;
  getDataFromId(id: string, type: string, source: string): Observable<MetadataDTO>;
}
