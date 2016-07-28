"use strict";

var electron = require("electron");
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on("window-all-closed",function(){
    if(process.platform != "darwin"){
        app.quit();
    }
});

//electronのinitが終わったら
app.on("ready",function(){
    //create window
    mainWindow = new BrowserWindow({width:1280,height:1024,"node-intefration":false});
    mainWindow.loadURL("file://" + __dirname + "/index.html");
    //mainWindow.loadURL("http://192.168.1.89:8080");
    //mainWindow.loadURL("http://192.168.1.89:8080");

    //windowが閉じられたら終了する
    mainWindow.on("closed",function(){
        mainWindow = null;
    });
});