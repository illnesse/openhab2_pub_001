import configparser
import os

ApplicationDir = os.path.dirname(os.path.abspath(__file__))
HomeDir = os.path.expanduser('~')
CredentialDir = os.path.join(HomeDir, '.credentials')

if not os.path.exists(CredentialDir):
    os.makedirs(CredentialDir)

CredentialFilePath = os.path.join(CredentialDir, 'CalSyncHAB.json')
CalSyncHABSettings = os.path.join(ApplicationDir, 'CalSyncHAB.ini')

Settings = configparser.ConfigParser()
Settings.read(CalSyncHABSettings)

ApplicationName = Settings.get('General', 'ApplicationName')

CalendarScope = Settings.get('Calendar', 'Scope')
CalendarId = Settings.get('Calendar', 'CalendarId')
CalendarMaxEvents = Settings.get('Calendar', 'MaxEvents')
CalendarTimeZone = Settings.get('Calendar', 'TimeZone')
CalendarClientSecretFile = Settings.get('Calendar', 'ClientSecretFile')

OpenHABHostName = Settings.get('OpenHAB', 'HostName')
OpenHABPort = Settings.get('OpenHAB', 'Port')
OpenHABItemPrefix = Settings.get('OpenHAB', 'ItemPrefix')
