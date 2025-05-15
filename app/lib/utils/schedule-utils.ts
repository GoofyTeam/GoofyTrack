/**
 * Utility functions for schedule management
 */

/**
 * Checks if a time slot is within the allowed event hours (9am-7pm)
 * @param time Time in format 'HH:MM'
 * @returns boolean
 */
export const isWithinEventHours = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const nineAM = 9 * 60;
  const sevenPM = 19 * 60;

  return totalMinutes >= nineAM && totalMinutes < sevenPM;
};

/**
 * Calculates the end time of a talk given its start time and duration
 * @param startTime Start time in format 'HH:MM'
 * @param durationMinutes Duration in minutes
 * @returns End time in format 'HH:MM'
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60) % 24; // Handle day wraparound
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

/**
 * Formats a date as a day string (e.g., "Monday, May 15")
 * @param date Date object
 * @returns Formatted date string
 */
export const formatDay = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

/**
 * Checks if two time slots overlap
 * @param slot1Start Start time of slot 1 in format 'HH:MM'
 * @param slot1Duration Duration of slot 1 in minutes
 * @param slot2Start Start time of slot 2 in format 'HH:MM'
 * @param slot2Duration Duration of slot 2 in minutes
 * @returns True if slots overlap, false otherwise
 */
export const doSlotsOverlap = (
  slot1Start: string,
  slot1Duration: number,
  slot2Start: string,
  slot2Duration: number,
): boolean => {
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const slot1StartMinutes = timeToMinutes(slot1Start);
  const slot1EndMinutes = slot1StartMinutes + slot1Duration;
  const slot2StartMinutes = timeToMinutes(slot2Start);
  const slot2EndMinutes = slot2StartMinutes + slot2Duration;

  return (
    (slot1StartMinutes >= slot2StartMinutes && slot1StartMinutes < slot2EndMinutes) || // Slot 1 starts during slot 2
    (slot1EndMinutes > slot2StartMinutes && slot1EndMinutes <= slot2EndMinutes) || // Slot 1 ends during slot 2
    (slot1StartMinutes <= slot2StartMinutes && slot1EndMinutes >= slot2EndMinutes) // Slot 1 completely covers slot 2
  );
};
