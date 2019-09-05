import $ from "jquery";
import { ipcRenderer } from "electron";
import TypeSetter from "./typesetter";

var ts = new TypeSetter();

$(function () {
    $("#contents").html("jQuery!!");
    ipcRenderer.send('get_arg');

    document.ondragover = document.ondragleave = document.ondrop = function (e) {
        if (e.type == 'drop' && e.dataTransfer) {
            let files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                let f = files.item(i);
                if (f != null)
                    ts.addFile(f.path);
            }
            ts.typeset();
            $("#contents").html(ts.getHtml());
        }
        e.preventDefault();
    }
});

ipcRenderer.on('openFile', (event, arg: string[]) => {
    for (let f of arg)
        ts.addFile(f);
    ts.typeset();
    $("#contents").html(ts.getHtml());
});

ipcRenderer.on('html', (event,arg)=>{
    console.log('html');
    event.sender.send('html',ts.getHtml());
});

ipcRenderer.on('arg', (event, arg: string[]) => {
    for (let f of arg)
        ts.addFile(f);
    ts.typeset();
    $("#contents").html(ts.getHtml());
});
