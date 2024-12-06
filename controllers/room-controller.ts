import { type Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { add, sub } from 'date-fns';

import catchAsync from '@/utils/catchAsync';
import { filterCalendarsByFreeEmails } from '@/utils/availableRooms';
import { eventPrefixRemoval } from '@/utils/eventPrefixRemoval';

import {
  initGoogleAdmin,
  initGoogleCalendar,
  JWTClient,
  oAuth2Client,
} from '@/lib/google';

import { type GetRoomSchema } from '@/validations/roomsValidation';
import { rooms } from '@/config/rooms';

export const getAllRooms = catchAsync(async (_req, res) => {
  const googleCalendar = initGoogleCalendar(JWTClient);

  const timeMin = sub(new Date(), { weeks: 2 }).toISOString();
  const timeMax = add(new Date(), { months: 1 }).toISOString();

  const calendarsResponse = await Promise.all(
    rooms.map(async (calendar) => {
      const calendarData = (
        await googleCalendar.calendars.get({ calendarId: calendar.id })
      ).data;

      const eventsResponse = await googleCalendar.events.list({
        calendarId: calendar.id,
        // timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin,
        timeMax,
        maxResults: 350,
      });

      // Find all events that have [Room:RoomName] in the summary and remove the prefix
      const modifiedData = eventsResponse?.data?.items?.map((event) =>
        eventPrefixRemoval(event, calendar.id)
      );

      return {
        ...calendarData,
        events: modifiedData,
        slug: calendar.slug,
      };
    })
  );

  return res.status(StatusCodes.OK).json(calendarsResponse);
});

export const getRoom = catchAsync(
  async (req: Request<GetRoomSchema['params']>, res) => {
    const { id } = req.params;
    const bearerToken = req.headers.authorization?.split(' ')[1];

    if (!bearerToken) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    oAuth2Client.setCredentials({
      access_token: bearerToken,
    });

    const googleAdmin = initGoogleAdmin(oAuth2Client);

    const calendarResources = googleAdmin.resources.calendars;

    const response = await calendarResources.get({
      customer: 'my_customer',
      calendarResourceId: id,
    });

    return res.status(StatusCodes.OK).json(response.data);
  }
);

export const getAvailableRooms = catchAsync(async (req, res) => {
  const timeZone = req.query?.timeZone as string;

  const googleCalendar = initGoogleCalendar(JWTClient);

  const calendars = await Promise.all(
    rooms.map(async (calendar) => {
      const calendarData = (
        await googleCalendar.calendars.get({ calendarId: calendar.id })
      ).data;

      return {
        ...calendarData,
        slug: calendar.slug,
      };
    })
  );

  const currentDateTime = new Date();

  const freeBusyResponse = await googleCalendar.freebusy.query({
    requestBody: {
      items: rooms,
      timeMin: currentDateTime.toISOString(),
      timeMax: new Date(
        currentDateTime.getTime() + 1 * 60 * 1000
      ).toISOString(),
      timeZone: timeZone ?? null,
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(filterCalendarsByFreeEmails(calendars, freeBusyResponse.data));
});
