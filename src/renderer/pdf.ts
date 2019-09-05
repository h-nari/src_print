import $ from "jquery";
import { ipcRenderer } from "electron";

ipcRenderer.on('html', (event, arg) => {
    $("#content").html(arg);
    ipcRenderer.send('pdfWinReady');
});

