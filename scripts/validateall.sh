#!/bin/bash

# This script validates the RAML and json schema as much as it can and then generates HTML version of the RAML. Specifically:
# 1) for all schemas, validate the corresponding example file against the schema
# 2) for all RAML files, generate the corresponding HTML version
# 3) generate an overall index.html file
#
# Before running, you'll need to install some of that node.js goodness...
# yum install npm
# npm i -g raml2html tv4
# export NODE_PATH=/usr/lib/node_modules
#

# use location of this script to locate our base directory. File layout must be like this:
# (dir)
#  |
#  +- index.html
#  +- scripts/(this script)
#  +- raml/
#  +- generated/
#  +- schemas/
#  +- examples/
DIR="$( cd "$( dirname "$0" )" && pwd )/.."

echo "validating all schemas"
$DIR/scripts/validateschemas.js $DIR

echo "generating HTML"

echo "<html><head><title>TAS core</title>" > $DIR/index.html
echo "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'>" >> $DIR/index.html
echo "<meta name='viewport' content='width=device-width, initial-scale=1'>" >> $DIR/index.html
echo "</head><body>" >> $DIR/index.html
echo "<div class='container'><h1>Talent App Store core APIs and schemas</h1>" >> $DIR/index.html

echo "<h2>APIs</h2><table class='table table-bordered table-condensed'><thead><tr><th></th><th>HTML</th><th>RAML</th></tr></thead><tbody>" >> $DIR/index.html
for f in $DIR/raml/*.raml
do
  b=$(basename $f)
  echo "  generating $b.html from $b"
  if [ ${b#*.} = "include.raml" ]; then
    echo "skipping generation for include file"
  else
    raml2html -i $f -o $DIR/generated/$b.html
    echo "<tr><td><b>${b%%.*}</b></td><td><a href='generated/$b.html'>$b.html</a></td><td><a href='raml/$b'>$b</a></td></tr>" >> $DIR/index.html
  fi
done
echo "</tbody></table>" >> $DIR/index.html

echo "<h2>Schemas</h2><table class='table table-bordered table-condensed'><thead><tr><th>schema</th><th>examples</th></tr></thead><tbody>" >> $DIR/index.html
for f in $DIR/schemas/*.json
do
  b=$(basename $f)
  
  exampleString=""
  # TODO: looping all files is well naff, wrestle shell file expansion into submission instead
  for example in $DIR/examples/*.json
  do
     e=$(basename $example)
     # trim extensions from each
     e=${e%.json}
     b=${b%.json}
     if [[ $e =~ $b\-.* ]]
       then
          exampleString="$exampleString <a href='examples/$e.json'>$e.json</a><br />"
     fi
  done
  
  echo "<tr><td><a href='schemas/$b.json'>$b.json</a></td><td>$exampleString</td></tr>" >> $DIR/index.html
done
echo "</tbody></table>" >> $DIR/index.html

echo "</div>" >> $DIR/index.html
echo "</body></html>" >> $DIR/index.html

echo "done generating HTML"

