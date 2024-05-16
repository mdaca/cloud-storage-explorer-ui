export class ByteUtil {

  /**
   * returns the user-friendly bytes value
   * ex: 3,141 bytes returns "3.14 KB"
   * if roundToOnes is true, it would instead return "3 KB"
   */
  /** Format bytes as human-readable text. */
  public static getDisplayBytes(bytes: number) {
    if (!bytes) {
      return "0 B";
    }

    const BASE_10 = 1000; // 1024 for base 2

    let e = Math.floor(Math.log(bytes) / Math.log(BASE_10));
    let adjustedBytes = (bytes / Math.pow(BASE_10, e));

    //the small bytes already gets an extra space from the short string-legend below
    let extraSpace = (e == 0) ? '' : ' ';
    return adjustedBytes.toPrecision(3) + extraSpace + ' KMGTPEZY'.charAt(e) + 'B';
  }

  /**
   * rounds bytes number to the hundredths
   * ex: "12.34567" returns "12"
   */
  static roundToOnes(bytes: number) {
    return Math.round(bytes);
  }

  /**
   * rounds bytes number to the hundredths
   * ex: "12.34567" returns "12.35"
   */
  static roundToHundredths(bytes: number) {
    return Math.round(bytes * 100) / 100;
  }

  static toPrecision(num: number, precision: number): number {
    return Number.parseFloat(num.toPrecision(precision));
  }

}
