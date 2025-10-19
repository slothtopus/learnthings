import { DateTime, Duration } from 'luxon';

export const ceilingDateTime = (
  dateTime: DateTime<true>,
  unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
): DateTime<true> => {
  const startOfNextUnit = dateTime.plus({ [unit]: 1 }).startOf(unit);

  if (dateTime.equals(dateTime.startOf(unit))) {
    return dateTime;
  }

  return startOfNextUnit;
};

export const floorDateTime = (
  dateTime: DateTime<true>,
  duration: { seconds: number } | { minutes: number } | { hours: number }
) => {
  const millisecondDuration = Duration.fromObject(duration).toMillis();
  return DateTime.fromMillis(
    Math.floor(dateTime.toMillis() / millisecondDuration) * millisecondDuration
  );
};

export const boundsDateTime = (
  dateTime: DateTime<true>,
  unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
): { upper: DateTime<true>; lower: DateTime<true> } => {
  return {
    lower: dateTime.startOf(unit),
    upper: dateTime.endOf(unit).startOf('second'),
  };
};
