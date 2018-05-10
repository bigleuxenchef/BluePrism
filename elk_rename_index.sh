#!/bin/bash -x
# rumi 2017
usage()
{
    echo "usage: elk_rename_index [-e HOST:PORT  -s STRING -d STRING |-u <user:password> | [-h]]"
}



while [ "$1" != "" ]; do
    case $1 in
        -e | --elk-host-port )	shift
				ELKHOSTPORT=$1
                                ;;
        -s | --source-pattern ) shift
				INDEXPATTERN=$1
                                ;;
        -d | --target-pattern ) shift
				NEWINDEXPATTERN=$1
                                ;;
        -u | --target-pattern ) shift
				USERPASSWORD="-u "$1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

indexes=$(curl -XGET "$ELKHOSTPORT/_cat/indices?v&pretty" $USERPASSWORD | awk '{ if (NR > 1) { print $3}}'|grep $INDEXPATTERN)
for SOURCE in $indexes
do
  echo $SOURCE

DESTINATION=$(echo $SOURCE | sed "s/$INDEXPATTERN/$NEWINDEXPATTERN/")

echo $DESTINATION

curl $USERPASSWORD -XPOST "$ELKHOSTPORT/_reindex" -H 'Content-Type: application/json' -d' 
{
  "source": {
    "index": "'"${SOURCE}"'"
  },
  "dest": {
    "index": "'"${DESTINATION}"'"
  }
}
'

done




