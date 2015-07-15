#!/usr/bin/env node

var tv4 = require('tv4');
var fs=require('fs');
var Ajv = require('ajv');
var ajv = Ajv();

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
					true, true); // true for check recursive and ban unknown properties
			if (res.errors.length == 0 && res.missing.length == 0 && res.valid == true)
				; // console.log("ok");
			else
				console.log(res);
//			console.log("missing schemas: " + JSON.stringify(arr, null, 4));
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
