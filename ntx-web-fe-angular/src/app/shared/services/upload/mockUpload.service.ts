import { of } from 'rxjs';

class MockUploadService {
  uploadMovieMetadata(formData: FormData) {
    const mockResponse = { id: 123 };
    return of(mockResponse);
  }
}
