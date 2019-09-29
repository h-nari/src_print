import $ from "jquery";
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/sortable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/sortable';

import { ipcRenderer } from "electron";
import GoldenLayout from "golden-layout";
import htmlGen from "../main/htmlGen";
import { FilePage } from "../main/typesetter";

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

ipcRenderer.on('pages', (event, pages: number) => {
    $("#pages").text(pages);
});

ipcRenderer.on('files', (event, file_pages: FilePage[]) => {
    let html: string = htmlGen('div', { class: 'file-page file-title' },
        ['div', 'File'],
        ['div', 'Page'],
        ['div', 'Pages'],
    );
    for (let fp of file_pages) {
        html += htmlGen('div', { class: 'file-page', page: fp.page, file: fp.fullpath },
            ['div', { title: fp.fullpath }, fp.name],
            ['div', fp.page],
            ['div', fp.pages]);
    }
    $("#files").html(html);

    $("#files").sortable({
        cancel: ".file-title",
        update: (event, ui) => {
            fileOrderChange(event.target);
        }
    });

    $("#files > div").on('click', (ev) => {
        let page = ev.currentTarget.getAttribute('page');
        if (page)
            gotoPage(parseInt(page));
    });
});

function fileOrderChange(frame: Element) {
    let files: string[] = [];
    let i,c,file;
    console.log(frame);
    for (i = 0; i < frame.childElementCount; i++) {
        if(c = frame.children.item(i)){
            if(file = c.getAttribute('file'))
                files.push(file);
        }
    }
    ipcRenderer.send('change-filelist', files);
}

function gotoPage(n: number) {
    console.log("goto Page:", n);

    let page = $(`#pageFrame div.page[page=${n}]`)[0];
    let offsetTop = page.offsetTop;
    let contents = page.parentElement;
    if (contents) {
        let frame = contents.parentElement;
        if (frame)
            frame.scrollTop = offsetTop;
    }
}

$(function () {
    var config = {
        content: [{
            type: 'column',
            content: [
                {
                    type: 'row',
                    content: [
                        {
                            type: 'component',
                            componentName: 'pages',
                            componentState: { label: 'Pages' },
                            width: 50,
                            height: 20,
                        },
                        {
                            type: 'component',
                            componentName: 'files',
                            componentState: { label: 'Files' },
                            width: 50,
                            height: 20
                        },

                    ]
                },
                {
                    type: 'component',
                    componentName: 'pageImages',
                    componentState: { label: 'Page Images' },
                    height: 80,
                    width: 100,
                    isClosable: false
                }
            ]
        }]
    };
    var myLayout: GoldenLayout = new GoldenLayout(config);

    myLayout.registerComponent('pages', function (container: any, componentState: any) {
        container.getElement().html(htmlGen('div', { id: "pages" }, componentState.label));
    });
    myLayout.registerComponent('files', function (container: any, componentState: any) {
        container.getElement().html(htmlGen('div', { id: "filesFrame" }, ['div', { id: "files" }, componentState.label]));
    });
    myLayout.registerComponent('pageImages', function (container: any, componentState: any) {
        container.getElement().html(htmlGen('div', { id: "pageFrame" },
            ['div', { id: "contents" }]));
    });

    myLayout.init();

});
