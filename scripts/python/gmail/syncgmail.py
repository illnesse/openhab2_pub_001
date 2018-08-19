from __future__ import print_function
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import json

SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
store = file.Storage('token.json')
creds = store.get()
if not creds or creds.invalid:
    flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
    creds = tools.run_flow(flow, store)
service = build('gmail', 'v1', http=creds.authorize(Http()))

results = service.users().messages().list(userId='me').execute()

bannedwords = ["eclipse/smarthome", "codetheweb/tuyapi","[OH2_System_Notification]"]
messages = []
if 'messages' in results:
    messages.extend(results['messages'])

i = 0
jsonout = []
for item in messages:
    jsontemp = {}
    message = service.users().messages().get(userId='me', id=item['threadId']).execute()

    if message["threadId"]:
        for headeritem in message["payload"]["headers"]:

            #print(headeritem)
            #if headeritem["name"] == "From":
                #jsontemp["From"] = headeritem["value"]
            #if headeritem["name"] == "Date":
                #jsontemp["Date"] = headeritem["value"]
            if headeritem["name"] == "Subject":
                jsontemp["Subject"] = headeritem["value"]

            jsontemp["id"] = i
            jsontemp["threadId"] = item['threadId']
            #jsontemp["snippet"] = message['snippet']

        if not "Subject" in jsontemp: 
            #print("wat")
            continue
        if any (word in jsontemp["Subject"] for word in bannedwords):
            #print("filtering " + jsontemp["Subject"])
            continue

    jsonout.append(jsontemp)
    i = i + 1
    if i == 50:
        break

print(json.dumps(jsonout))
#for jsonitem in jsonout:
    #print(jsonitem)
