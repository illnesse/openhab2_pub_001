import httplib2
import os
import datetime
import argparse as AP
import Settings as S
import warnings
import requests
import time
import json
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

parser = AP.ArgumentParser(parents=[tools.argparser])
parser.add_argument('--id', default='id', type=str)
parser.add_argument('--prefix', default='prefix', type=str)
parser.add_argument('--action', default='list', type=str)
parser.add_argument('--summary', default='summary', type=str)
parser.add_argument('--begin', default='begin', type=str)
parser.add_argument('--end', default='end', type=str)

Flags = parser.parse_args()

#print Flags.prefix

def GetCredentials():
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        CredentialStore = Storage(S.CredentialFilePath)
        Credentials = CredentialStore.get()
    
    if not Credentials or Credentials.invalid:
        AuthenticationFlow = client.flow_from_clientsecrets(S.CalendarClientSecretFile, S.CalendarScope)
        AuthenticationFlow.user_agent = S.ApplicationName
        Credentials = tools.run_flow(AuthenticationFlow, CredentialStore, Flags)

    return Credentials

def Main():
    Credentials = GetCredentials()
    HTTPAuthorization = Credentials.authorize(httplib2.Http())
    CalendarService = discovery.build('calendar', 'v3', http = HTTPAuthorization)
    CurrentTime = datetime.datetime.utcnow().isoformat() + 'Z'

    Summary = Flags.summary.replace('"', '')

    if Flags.action == "post":
        #print(Flags.action)
        event = {
            'summary': Summary,
            'location': 'home',
            'start': {
                'dateTime': Flags.begin,
                'timeZone': 'Europe/Berlin',
            },
            'end': {
                'dateTime': Flags.end,
                'timeZone': 'Europe/Berlin',
            },
            'reminders': {
                'useDefault': True,
            },
        }
        print(event)
        event = CalendarService.events().insert(calendarId=Flags.id, body=event).execute()
        print('Event created: %s' % (event.get('htmlLink')))

    else:
        CalendarEvents = CalendarService.events().list(
            calendarId = Flags.id,  #S.CalendarId,
            timeMin = CurrentTime,
            maxResults = S.CalendarMaxEvents,
            singleEvents = True,
            orderBy = 'startTime').execute()

        RetrievedEvents = CalendarEvents.get('items', [])
        #MaxEvents = int(S.CalendarMaxEvents)

        if not RetrievedEvents:
            print('No upcoming events found.')

        # if S.OpenHABPort.strip() != '':
        #     TrimmedHostAndPort = S.OpenHABHostName.strip() + ':' + S.OpenHABPort.strip()
        # else:
        #     TrimmedHostAndPort = S.OpenHABHostName.strip()

        #EventCounter = 0

        print(json.dumps(RetrievedEvents))

        # for SingleEvent in RetrievedEvents:
        #     EventSummary = ''
        #     #EventLocation = ''
        #     #EventDescription = ''
        #     EventStartTime = None
        #     EventEndTime = None

        #     EventCounter += 1

        #     if 'summary' in SingleEvent:
        #         EventSummary = SingleEvent['summary']

        #     if 'start' in SingleEvent:
        #         EventStartTime = SingleEvent['start'].get('dateTime', SingleEvent['start'].get('date'))

        #     try:
        #         datetime.datetime.strptime(EventStartTime, '%Y-%m-%dT%H:%M:%S' + S.CalendarTimeZone)
        #     except ValueError:
        #         EventStartTime = EventStartTime + 'T00:00:00' + S.CalendarTimeZone

        #     if 'end' in SingleEvent:
        #         EventEndTime = SingleEvent['end'].get('dateTime', SingleEvent['end'].get('date'))

        #     try:
        #         datetime.datetime.strptime(EventEndTime, '%Y-%m-%dT%H:%M:%S' + S.CalendarTimeZone)
        #     except ValueError:
        #         EventEndTime = EventEndTime + 'T00:00:00' + S.CalendarTimeZone            

        #     CalendarEventSummaryItemURL = 'http://' + TrimmedHostAndPort + '/rest/items/' + Flags.prefix + 'Event' + str(EventCounter) + '__Summary'
        #     OpenHABResponse = requests.post(CalendarEventSummaryItemURL, data = EventSummary.encode('utf-8'), allow_redirects = True)
        #     #time.sleep(0.2)
        #     CalendarEventStartTimeItemURL = 'http://' + TrimmedHostAndPort + '/rest/items/' + Flags.prefix + 'Event' + str(EventCounter) + '__StartTime'
        #     OpenHABResponse = requests.post(CalendarEventStartTimeItemURL, data = EventStartTime, allow_redirects = True)
        #     #time.sleep(0.2)
        #     CalendarEventEndTimeItemURL = 'http://' + TrimmedHostAndPort + '/rest/items/' + Flags.prefix + 'Event' + str(EventCounter) + '__EndTime'
        #     OpenHABResponse = requests.post(CalendarEventEndTimeItemURL, data = EventEndTime, allow_redirects = True)
        #     #time.sleep(0.2)
            
if __name__ == '__main__':
    Main()
