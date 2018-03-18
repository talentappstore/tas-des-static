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

echo "validating all schemas"
$SCRIPTDIR/validateschemas.js $DIR

echo "generating HTML"

echo "<html><head><title>TAS core</title>" > $DIR/generated/index.html
echo "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'>" >> $DIR/generated/index.html
echo "<meta name='viewport' content='width=device-width, initial-scale=1'>" >> $DIR/generated/index.html
echo "</head><body>" >> $DIR/generated/index.html
NAME=`cat $DIR/meta/name`
echo "<div class='container'><h1>$NAME</h1>" >> $DIR/generated/index.html

echo "<h2>APIs</h2><table class='table table-bordered table-condensed'><thead><tr><th></th><th>HTML</th><th>RAML</th></tr></thead><tbody>" >> $DIR/generated/index.html
for f in $DIR/raml/*.raml
do
  b=$(basename $f)
  echo "  generating $b.html from $b"
  if [ ${b#*.} = "include.raml" ]; then
    echo "skipping generation for include file"
  else
    mkdir -p $DIR/generated
    echo "  will generate $b.html"
    raml2html -i $f -o $DIR/generated/$b.html
    echo "<tr><td><b>${b%%.*}</b></td><td><a href='../generated/$b.html'>$b.html</a></td><td><a href='../raml/$b'>$b</a></td></tr>" >> $DIR/generated/index.html
    echo "  done generating $b.html"
  fi
done
echo "</tbody></table>" >> $DIR/generated/index.html

echo "<h2>Schemas</h2><table class='table table-bordered table-condensed'><thead><tr><th>schema</th><th>examples</th></tr></thead><tbody>" >> $DIR/generated/index.html
for f in $DIR/schemas/*.json
do
  b=$(basename $f .json)
  
  exampleString=""
  for example in $DIR/examples/$b*.json
  do
     e=$(basename $example .json)
     if [[ $e =~ $b\-.* ]] && [[ -f $DIR/examples/$e.json ]]
       then
          echo "schema $b example $e"
          exampleString="$exampleString <a href='../examples/$e.json'>$e.json</a><br />"
     fi
  done
  
  echo "<tr><td><a href='../schemas/$b.json'>$b.json</a></td><td>$exampleString</td></tr>" >> $DIR/generated/index.html
done
echo "</tbody></table>" >> $DIR/generated/index.html

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


echo "generating index of files in $DIR/doc"

echo "<h2>Documentation</h2><table class='table table-bordered table-condensed'><thead><tr><th>File</th></tr></thead><tbody>" >> $DIR/generated/index.html
for f in $DIR/doc/*.html
do
  b=$(basename $f)
  echo "<tr><td><a href='../doc/$b'>$b</a></td></tr>" >> $DIR/generated/index.html
done
echo "</tbody></table>" >> $DIR/generated/index.html

echo "</div>" >> $DIR/generated/index.html
echo "</body></html>" >> $DIR/generated/index.html

echo "done generating HTML"

