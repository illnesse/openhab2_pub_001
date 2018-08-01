PID=`ps aux --sort=start_time | grep openhab.*java | grep -v grep | awk '{print $2}' | tail -1`
MEM=`ps eo vsz "${PID}" | cut -d ' ' -f 1`
echo $MEM | bc