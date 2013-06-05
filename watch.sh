#!/bin/bash

PWD=`pwd`

if [[ $1 == "start" ]]; then
    watchman watch "${PWD}"
    watchman -- trigger "${PWD}" hathor-rebuild '*.scss' -- ${PWD}/watch.sh rebuild
elif [[ $1 == "stop" ]]; then
    watchman watch-del "${PWD}"
elif [[ $1 == "rebuild" ]]; then
    make templates
else
    watchman watch-list
    watchman trigger-list "${PWD}"
fi
