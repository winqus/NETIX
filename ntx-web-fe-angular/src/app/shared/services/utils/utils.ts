/**
 * Utility function to format a date to yyyy-mm-dd
 * @param date - Date object
 * @returns formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

/**
 * Utility function to convert minutes or seconds to hh:mm:ss format
 * @param time - time in minutes or seconds
 * @param isSeconds - boolean flag to indicate if the input time is in seconds
 * @returns formatted time string
 */
export function formatTime(time: number, isSeconds: boolean = false): string {
  if (isNaN(time) || time == undefined || time == null) {
    return '00:00';
  }
  let totalSeconds = Math.floor(isSeconds ? time : time * 60);

  const hours: number = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes: number = Math.floor(totalSeconds / 60);
  const seconds: number = totalSeconds % 60;

  let formattedTimeString: string = '';

  if (hours > 0) formattedTimeString += `${padZero(hours)}:`;

  formattedTimeString += `${padZero(minutes)}:${padZero(seconds)}`;

  return formattedTimeString;
}

/**
 * Utility helper function to pad number with zeros
 * @param num - number to pad
 * @returns padded string
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : num.toString();
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
