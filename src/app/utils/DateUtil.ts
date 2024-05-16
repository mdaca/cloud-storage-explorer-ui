export class DateUtil {

  static oneWeekAgo(): Date {
    let today = new Date();
    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }

}
