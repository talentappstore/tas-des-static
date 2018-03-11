#!/bin/bash

# This script validates your structured design files (raml, json schema, json examples) as much
# as it can and then generates
# an index.html file and the HTML versions of the RAML files. Specifically:
# 1) for all schemas, validate the corresponding example file against the schema
# 2) for all RAML files, generate the corresponding HTML version
# 3) generate an overall index.html file with links to all of the structured docs
#
# Before running, you'll need to install some of that node.js goodness...
# yum install npm
# npm i -g raml2html@3.0.1 tv4 tv4-formats ajv
# export NODE_PATH=/usr/lib/node_modules
# For ubuntu: export NODE_PATH=/usr/local/lib/node_modules

# use location of this script to locate other scripts
SCRIPTDIR="$( cd "$( dirname "$0" )" && pwd )"

# use parameter to locate our base directory
if [ "$#" -ne 1 ]; then
  echo "Usage: builddes.sh rootdir"
  echo "where directory layout is like this:"
  echo "(rootdir)"
  echo " |"
  echo " +- index.html"
  echo " +- raml/"
  echo " +- generated/"
  echo " +- schemas/"
  echo " +- examples/"
  echo " +- doc/"
  exit 1
else
  DIR=$1  
fi

echo "deleting all files in $DIR/doc"
rm $DIR/doc/*

echo "processing doc files in $DIR/raw to inject document index sidebar"
for f in $DIR/raw/*.html
do
  b=$(basename $f)
  echo "$f -> $DIR/doc/$b"
# as per https://unix.stackexchange.com/a/49438  
sed -e '/SIDEBARGOESHERE/ {' -e "r $DIR/inserts/sidebar.html" -e 'd' -e '}' $f > $DIR/doc/$b  
#  sed -e '/SIDEBARGOESHERE/ {' -e "r $DIR/inserts/sidebar.html" -e 'd' -e '}' -i $f  
done
