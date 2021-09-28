#!/bin/bash

echo "------------- Odd/Even ---------------"
echo -n "Enter a number: "

read number < /dev/tty

if [ `expr $number % 2` -eq 0 ]
then
    echo "$number is even."
else
    echo "$number is odd."
fi

exit 0
