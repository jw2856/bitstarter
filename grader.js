#!/usr/bin/env node

/* Automatically grade files for presence of specified HTML tags/attributes. */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://obscure-plateau-5343.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var getUrl = function(url) {
    return url.toString();
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var buildChecksOutput = function(checks, $) {
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
}

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    return buildChecksOutput(checks, $);
};

var checkUrl = function(url, checksfile) {
    rest.get(url).on('complete', function(result) {
	if(result instanceof Error) {
	    console.log('There was an error retrieving the URL.');
	    process.exit(1);
	} else {
	    $ = cheerio.load(result);
	    var checks = loadChecks(checksfile).sort();
	    var checkJson = buildChecksOutput(checks, $);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	}
    });
}

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) { // If run from the command line
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'URL of html file. If a  URL is entered, it will override any files entered.', clone(getUrl))
    .parse(process.argv);
    
    var checkJson, file, html;

    if (program.url) {
	checkUrl(program.url, program.checks);
    } else {
	file = program.file;
        checkJson = checkHtmlFile(file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}





