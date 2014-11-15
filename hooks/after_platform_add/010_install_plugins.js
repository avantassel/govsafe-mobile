#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either the identifier, the filesystem location or the URL
var pluginlist = [
    "org.apache.cordova.device",
    "org.apache.cordova.device-motion",
    "org.apache.cordova.device-orientation",
    "org.apache.cordova.geolocation",
    "org.apache.cordova.inappbrowser",
    "org.apache.cordova.statusbar",
    "org.apache.cordova.splashscreen",
    "org.apache.cordova.network-information",
    "https://github.com/chrisekelley/AppPreferences/",
    "https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git",
    "https://github.com/christocracy/cordova-plugin-background-geolocation.git"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
