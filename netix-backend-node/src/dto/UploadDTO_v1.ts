// export default interface UploadDTO_v1 {
//   version: 'v1';
//   uploadID: string;
//   uploaderID: string;
//   createdDateTime: Date;
//   uploadedDateTime: Date;
//   thumbnail: {
//     version: 'v1';
//     createdDateTime: Date;
//     updatedDateTime: Date;
//     thumbnailID: string;
//     mimeType: string;
//     accessURL: string;
//   };
//   metadata: {
//     version: 'v1';
//     createdDateTime: Date;
//     updatedDateTime: Date;
//     description: {
//       title: string;
//       tags: string[];
//       categories: string[];
//       author?: string;
//       license?: string;
//     };
//     video: {
//       lengthInSeconds: number;
//       resolution: string; // e.g., "1920x1080"
//       codec: string; // e.g., "H.264"
//       frameRate: number; // e.g., 30
//     };
//     publishDatetime: Date;
//   };
//   videoStream: {
//     version: 'v1';
//     createdDateTime: Date;
//     updatedDateTime: Date;
//     protocol: 'HLS';
//     totalSizeInBytes: number;
//     streamID: string;
//     accessURL: string;
//   };
// }
