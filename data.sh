#!/bin/bash

psql -h localhost -d spacetime -U postgres -f query.sql -t > data/maps.csv
cat data/maps.csv | node convert.js > data/maps.json
