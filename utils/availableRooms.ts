import { type calendar_v3 } from 'googleapis';

function getCalendarsWithNoBusy(
  data: calendar_v3.Schema$FreeBusyResponse
): string[] {
  const noBusyCalendars = [];

  for (const calendarId in data.calendars) {
    if (
      data.calendars[calendarId] &&
      data.calendars[calendarId].busy?.length === 0
    ) {
      noBusyCalendars.push(calendarId);
    }
  }

  return noBusyCalendars;
}

function filterCalendarsByFreeEmails(
  allCalendars: calendar_v3.Schema$Calendar[],
  free: calendar_v3.Schema$FreeBusyResponse
): calendar_v3.Schema$Calendar[] | undefined {
  const noBusyCalendars = getCalendarsWithNoBusy(free);

  return allCalendars?.filter((calendar) =>
    noBusyCalendars.includes(calendar?.id ?? '')
  );
}

export { getCalendarsWithNoBusy, filterCalendarsByFreeEmails };
