import { NextRequest, NextResponse } from 'next/server';
import {
  sendGmailMessage,
  createLiveCalendarEvent,
  updateLiveCalendarEvent,
  createLiveTask,
  updateLiveTaskStatus,
} from '@/lib/workspace';

export async function POST(req: NextRequest) {
  try {
    const { actionType, payload, accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Google authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (!actionType || !payload) {
      return NextResponse.json(
        { success: false, error: 'Missing actionType or payload' },
        { status: 400 }
      );
    }

    if (actionType === 'send_email') {
      const { recipient, subject, body } = payload;
      if (!recipient || !subject || !body) {
        return NextResponse.json(
          { success: false, error: 'Recipient, subject, and body are required to send an email.' },
          { status: 400 }
        );
      }

      const result = await sendGmailMessage(accessToken, recipient, subject, body);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Email sent to ${recipient}`,
        id: result.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (actionType === 'create_calendar_event') {
      const { title, startTime, endTime, date, attendees, description } = payload;
      const startDateTime = date && startTime ? new Date(`${date} ${startTime}`).toISOString() : new Date().toISOString();
      const endDateTime = date && endTime ? new Date(`${date} ${endTime}`).toISOString() : new Date(Date.now() + 30 * 60000).toISOString();

      const attendeeObjects = attendees?.map((a: string) => ({ email: a })) || [];

      const result = await createLiveCalendarEvent(accessToken, {
        summary: title || 'New Event',
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        attendees: attendeeObjects,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Calendar event "${title}" created`,
        id: result.event?.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (actionType === 'update_calendar_event') {
      const { eventId, title, startTime, endTime, date } = payload;
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'Event ID required to reschedule' }, { status: 400 });
      }

      const patch: any = {};
      if (title) patch.summary = title;
      if (date && startTime) {
        patch.start = { dateTime: new Date(`${date} ${startTime}`).toISOString() };
      }
      if (date && endTime) {
        patch.end = { dateTime: new Date(`${date} ${endTime}`).toISOString() };
      }

      const result = await updateLiveCalendarEvent(accessToken, eventId, patch);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Calendar event updated successfully`,
        id: result.event?.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (actionType === 'create_task') {
      const { taskTitle, notes, dueDate } = payload;
      if (!taskTitle) {
        return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
      }

      const result = await createLiveTask(accessToken, taskTitle, notes, dueDate);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Task "${taskTitle}" created in Google Tasks`,
        id: result.task?.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (actionType === 'complete_task') {
      const { taskId } = payload;
      if (!taskId) {
        return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
      }

      const result = await updateLiveTaskStatus(accessToken, taskId, 'completed');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Task marked as completed`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action type' }, { status: 400 });
  } catch (error: any) {
    console.error('Execute action error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Execution error' }, { status: 500 });
  }
}
