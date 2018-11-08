#echo $@
sudo sshpass -p \XXXXXx ssh root@192.168.178.25 "sudo shutdown; /bin/bash -i"

#echo -n mem > /sys/power/state