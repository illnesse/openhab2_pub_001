from __future__ import print_function
import datetime
from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import argparse as AP
import json

parser = AP.ArgumentParser(parents=[tools.argparser])
parser.add_argument('--id', default='id', type=str)
parser.add_argument('--prefix', default='prefix', type=str)
parser.add_argument('--action', default='list', type=str)
parser.add_argument('--summary', default='summary', type=str)
parser.add_argument('--begin', default='begin', type=str)
parser.add_argument('--end', default='end', type=str)

Flags = parser.parse_args()

# If modifying these scopes, delete the file token.json.
SCOPES = 'https://www.googleapis.com/auth/calendar'



def main():
    store = file.Storage(Flags.id+'_token.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('calendar', 'v3', http=creds.authorize(Http()))

    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time


    if Flags.action == "post":
        Summary = Flags.summary.replace('"', '')
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
        event = service.events().insert(calendarId=Flags.id, body=event).execute()
        print('Event created: %s' % (event.get('htmlLink')))

    else:

        events_result = service.events().list(calendarId=Flags.id, timeMin=now,
                                            maxResults=8, singleEvents=True,
                                            orderBy='startTime').execute()
        events = events_result.get('items', [])
        jsonout = []

        if not events:
            print('No upcoming events found.')
        for event in events:
            jsontemp = {}
            jsontemp["start"] = event['start']
            jsontemp["id"] = event['id']
            jsontemp["summary"] = event['summary']
            jsonout.append(jsontemp)

        print(json.dumps(jsonout))

if __name__ == '__main__':
    main()