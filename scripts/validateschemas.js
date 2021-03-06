#!/usr/bin/env node

// var tv4 = require('tv4');
var tv4 = require('tv4'),
formats = require('tv4-formats');
tv4.addFormat(formats);

var fs=require('fs');
var Ajv = require('ajv');

// the following is as per https://github.com/epoberezkin/ajv/releases/tag/5.0.0
// remove once we've migrated all schemas from draft-04
//var ajv = Ajv();
var ajv = new Ajv({
	  meta: false, // optional, to prevent adding draft-06 meta-schema
	  extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
	  unknownFormats: 'ignore',  // optional, current default is true (fail)
	  // ...
	});

	var metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
	ajv.addMetaSchema(metaSchema);
	ajv._opts.defaultMeta = metaSchema.id;

	// optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
	ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

	// Optionally you can also disable keywords defined in draft-06
	ajv.removeKeyword('propertyNames');
	ajv.removeKeyword('contains');
	ajv.removeKeyword('const');

	
	
var args = process.argv.slice(2);

var dir = args[0];

var schemasHaveErrors = false;

validateSchemas();

//main
if (!schemasHaveErrors) {
	loadSchemas();

	// to check a single schema, do this:
	// ./scripts/validateschemas.js . theSchema.json

	if (args.length == 1)
		validateAllSchemaExamples();
	else
		validateSchemaExamples(args[1]);
} else {
	console.log('\nschemas have errors, please fix the errors to continue validation\n');
}


function validateSchemas() {
	var schemaFiles = fs.readdirSync(dir + '/schemas')
		.map( function(file) {
			return dir + '/schemas/' + file;
		});

	console.log('begin validating schemas');
	schemaFiles.forEach( function (file) {
		console.log('  validating ' + file);
		var schema = JSON.parse(fs.readFileSync(file));
		ajv.validateSchema(schema);
		if (ajv.errors) {
			schemasHaveErrors = true;
		       	console.log('    ERROR: ' + JSON.stringify(ajv.errors, null, 4));
		}
	});
	console.log('end validating schemas');
}

function loadSchemas() {
	//load individual schemas. tv4 does not (in any obvious way) report errors for missing schemas, so its important to load them!
	console.log('looping to load all schemas');
	var schemafiles = [];
	var arrayOfSchemaFiles = fs.readdirSync(dir + '/schemas');
	arrayOfSchemaFiles.forEach( function (schemaFile) {
		console.log('  adding schema: ' + schemaFile);
		var loadSchemaText = fs.readFileSync(dir + '/schemas/' + schemaFile);
		var loadSchema = JSON.parse(loadSchemaText);
		tv4.addSchema(schemaFile, loadSchema);
	});
	console.log('done adding schemas');
}

function validateExamplesForSchema(schemaFile) {
	console.log('  schema: ' + schemaFile);

	var exampleFound = false;
	var schemaFileName = schemaFile.substr(0, schemaFile.lastIndexOf('.'));
	var arrayOfExampleFiles = fs.readdirSync(dir + '/examples');
	arrayOfExampleFiles.forEach( function (exampleFile) {

		var exampleFileBase = exampleFile.substr(0, exampleFile.lastIndexOf('-'));  // probably there is a cooler way to do this
		if (exampleFileBase.localeCompare(schemaFileName) == 0) {
			exampleFound = true;

			console.log('	 example: ' + exampleFile);
			var exampleText = fs.readFileSync(dir + '/examples/' + exampleFile);
			var example = JSON.parse(exampleText);
			var res = tv4.validateMultiple(example,
					schemaFile,
					false, // false as cyclical object references cannot occur within json
					true); // true for ban unknown properties -- can't have undocumented properties in the examples
			if (res.errors.length == 0 && res.missing.length == 0 && res.valid == true) {
				// console.log("ok");
			} else {
				console.log("ERROR Failed to validate against " + schemaFile )
				res.errors.forEach(function(err) {
					console.log("  - " + err.message + " at " + err.dataPath + " against rule " + err.schemaPath);
				});
			}
		}
	});
	if (! exampleFound)
		console.log('WARNING: no examples found for schema: ' + schemaFile);
}


function validateAllSchemaExamples() {
	//loop for all schema files
	console.log('looping to test schemas by validating their corresponding examples');
	var schemafiles = [];
	var arrayOfSchemaFiles = fs.readdirSync(dir + '/schemas');
		arrayOfSchemaFiles.forEach( function (schemaFile) {
			validateExamplesForSchema(schemaFile);
	});
	console.log('done validating');
}

function validateSchemaExamples(schemaFile) {
	console.log('testing schema ' + schemaFile + ' by validating its corresponding examples');
	validateExamplesForSchema(schemaFile);
	console.log('done validating');
}
