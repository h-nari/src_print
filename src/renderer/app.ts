import $ from "jquery";
import { ipcRenderer } from "electron";
import process from "process";
import { files2html } from "./text2html";

$(function () {
    $("#contents").html("jQuery!!");
    ipcRenderer.send('get_arg');
});

ipcRenderer.on('openFile', (event, arg) => {
    let html = files2html(arg);
    $("#contents").html(html);
});

ipcRenderer.on('print', (event, arg) => {
    console.log('print:', arg);
});

ipcRenderer.on('arg', (event, arg) => {
    console.log('arg:', arg);
    let html: string = files2html(arg);
    $("#contents").html(html);
});
