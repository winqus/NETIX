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
export function formatTime(time?: number, isSeconds: boolean = false): string {
  if (time == undefined) {
    return '00:00:00';
  }

  let totalSeconds = isSeconds ? time : time * 60;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
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

/**
 * Method is use to download file.
 * @param data - Array Buffer data
 * @param type - type of the document.
 */
export function downLoadFile(data: any, type: string): Blob {
  const blob = new Blob([data], { type: type });
  const url = window.URL.createObjectURL(blob);
  const pwa = window.open(url);
  if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
    alert('Please disable your Pop-up blocker and try again.');
  }
  return blob;
}
