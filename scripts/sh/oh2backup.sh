backuploc="/home/openhabian/oh2bak/oh2_2"
confdir="/etc/openhab2"

logfolder="/home/openhabian/oh2bak/logs"
logfilename="oh2backup_$(date +%Y%m%d_%H%M%S)"
oh2backupresult=$logfolder/$logfilename

mkdir -p $logfolder
touch $oh2backupresult

/usr/bin/rsync -r $confdir $backuploc --delete --ignore-errors

cd /home/openhabian/oh2bak/oh2_2
/usr/bin/git pull --no-edit
/usr/bin/git add openhab2
/usr/bin/git commit -m "generated files on `date +'%Y-%m-%d %H:%M:%S'`" >> $oh2backupresult
/usr/bin/git push >> $oh2backupresult


