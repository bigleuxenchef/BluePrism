#!/bin/bash 


# manage parameters

usage()
{
    echo "usage: $0 [-A <datepart>| [-h]] [-C]"
}

while [ "$1" != "" ]; do
    case $1 in
        -A | --audit   )	shift
				DATEPART=$1
                                ;;
        -C | --create-file)     CREATEFILE="true"
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

# Global Declaration

COMMAND=./BpDevOps_Ext.js

# capture the list of changes


processlist=$($COMMAND GetProcessList -A $DATEPART -f raw -l OFF| awk -F ";" '{print $1}')
IFS=$'\n'

for PROCESS in $processlist
do
  if [[ -n "$CREATEFILE"  ]] 
  then
  	$COMMAND GetProcessXml -n $PROCESS -f xml -l OFF  > ./$PROCESS.xml
  else
  	$COMMAND GetProcessXml -n $PROCESS -f xml -l OFF 

  fi
done





