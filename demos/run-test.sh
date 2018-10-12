#!/usr/bin/env bash

mkdir -p logs

if [ "$1" == "*" ]; then
    EXIT_CODE=0
    for i in demos/*; do
        if [ -f "$i/test.js" ]; then
            if ! [[ "$i" =~ ^demos/(graphs.*|pca|routing|mpc-web|template)$ ]]; then
                npm run-script test-demo -- "$i"
                CODE=$?
                EXIT_CODE=${EXIT_CODE}||${CODE}
            fi
        fi
    done
    exit "$EXIT_CODE"
else
    TESTDIR=${1%/}
    NAME=$(basename $TESTDIR)
    logs="logs/${NAME}.log"
    echo "Server logs at ${logs}"

    # Run server
    echo "====================" >> "${logs}"
    echo "====================" >> "${logs}"
    echo "NEW TEST $(date)" >> "${logs}"
    echo "====================" >> "${logs}"
    node ${TESTDIR}/server.js >> "${logs}" &


    # Run test
    ./node_modules/.bin/mocha --full-trace --reporter spec ${TESTDIR}/test.js
    EXIT_CODE=$?

    kill $(ps aux | grep " ${TESTDIR}/server\.js" | awk '{ print $2}')
    exit "$EXIT_CODE"
fi