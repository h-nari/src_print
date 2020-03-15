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

var totalPage : number = 0;
var curPage: number = 1;

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
    $("div#pageFrame").scroll((e) => {
        currentPage();
    });
    $(".btn-first-page").on('click', ()=>{gotoPage(1);});
    $(".btn-prev-page").on('click', ()=>{gotoPage(curPage - 1);});
    $(".btn-next-page").on('click', ()=>{gotoPage(curPage + 1);});
    $(".btn-last-page").on('click', ()=>{gotoPage(totalPage);});
    currentPage();
});

ipcRenderer.on('pages', (event, pages: number) => {
    $("#pages").text(pages);
    $("span#pages").text(pages);
    totalPage = pages;
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
    let i, c, file;
    console.log(frame);
    for (i = 0; i < frame.childElementCount; i++) {
        if (c = frame.children.item(i)) {
            if (file = c.getAttribute('file'))
                files.push(file);
        }
    }
    ipcRenderer.send('change-filelist', files);
}

function gotoPage(n: number) {
    console.log("goto Page:", n);

    if(n < 1) n = 1;
    else if(n > totalPage) n = totalPage;
    let page = $(`#pageFrame div.page[page=${n}]`)[0];
    let offsetTop = page.offsetTop;
    let contents = page.parentElement;
    if (contents) {
        let frame = contents.parentElement;
        if (frame)
            frame.scrollTop = offsetTop;
    }
}

// 表示中のページ数を表示する
function currentPage() {
    let frame = $('div#pageFrame')[0];
    let y = frame ? frame.scrollTop + frame.offsetTop: 0;
    let pages = $('div#pageFrame div.page[page]').get();
    let pn:number = 0;
    
    for (let page of pages) {
        if (y >= page.offsetTop && y < page.offsetTop + page.offsetHeight){
            pn = parseInt(page.attributes.page.value);
        }
        $('input.pageNum').val(pn);
    }
    curPage = pn;
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
        container.getElement().html(htmlGen('div', { id: 'pageFrame0' },
            ['div', { class: 'button-box page-navigation' },
                ['button', {class: 'btn-first-page'},['span', { class: 'material-icons' }, 'first_page']],
                ['button', {class: 'btn-prev-page'},['span', { class: 'material-icons' }, 'chevron_left']],
                ['input', { class: 'pageNum', size: 3 }],
                ['span', '/'],
                ['span', { id: 'pages' }, 'Total'],
                ['button', {class: 'btn-next-page'}, ['span', { class: 'material-icons' }, 'chevron_right']],
                ['button', {class: 'btn-last-page'}, ['span', { class: 'material-icons' }, 'last_page']]
            ],
            ['div', { id: "pageFrame" },
                ['div', { id: "contents" }]]));
    });

    myLayout.init();

});
