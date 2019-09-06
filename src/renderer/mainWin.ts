import $ from "jquery";
import { ipcRenderer } from "electron";

document.ondragover = document.ondragleave = document.ondrop = function (e) {
    if (e.type == 'drop' && e.dataTransfer) {
        let files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            let f = files.item(i);
            if (f != null)
                ipcRenderer.send('addFile', f.path);
        }
    }
    e.preventDefault();
};

ipcRenderer.on('html', (event, html: string) => {
    $("#contents").html(html);
});
