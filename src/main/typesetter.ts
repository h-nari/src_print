import fs from "fs";
import path from "path";
import moment from 'moment';
import htmlGen from "./htmlGen";
import { escape_html } from "./text2html";

interface Line {
    bFirstLine: boolean;
    lineNo: number;
    text: string;
};

interface Page {
    fileName: string;
    fullPath: string;
    pageNo: number;
    totalPage: number;
    lines: Line[];
}

interface Settings {
    tab_width: number,
    column_per_line: number,
    line_per_page: number
}

export interface FilePage {
    fullpath: string,
    name: string,
    page: number,
    pages: number
}

export default class TypeSetter {
    private setting: Settings;
    private files: string[];
    private html: string;
    private pages: Page[];
    private dateTimeStr: string;
    private file_pages: FilePage[];
    private textFilenamePat: RegExp;

    constructor() {
        this.setting = {
            tab_width: 8,
            column_per_line: 80,
            line_per_page: 66
        };


        this.files = [];
        this.pages = [];
        this.html = "";
        this.dateTimeStr = "";
        this.file_pages = [];
        this.textFilenamePat = /\.(txt|js|ts|c|cpp|h|log|csv|json|html)$/;
    }

    resetFiles(){
        this.files = [];
    }

    addFile(filename: string) {
        console.log("addFile:", filename);
        try {
        let stats = fs.statSync(filename);
        if (stats.isDirectory())
            this.addDirectory(filename);
        else
            this.files.push(filename);
        } catch(err) {
            console.log(filename,' not found.');
        }
    }

    addDirectory(dirname: string) {
        let files = fs.readdirSync(dirname, { withFileTypes: true });

        for (let dirent of files) {
            let fullpath = path.join(dirname, dirent.name);
            if (dirent.isDirectory())
                this.addDirectory(fullpath);
            else if (dirent.name.match(this.textFilenamePat))
                this.addFile(fullpath);
            else
                console.log("skip:", fullpath);
        }
    }

    getHtml(): string {
        return this.html;
    }

    getPages(): number {
        return this.pages.length;
    }

    getFiles(): FilePage[] {
        return this.file_pages;
    }

    typeset() {
        this.dateTimeStr = moment().format('YYYY/MM/DD(ddd) HH:MM:SS');
        this.pages = [];
        this.html = "";
        this.file_pages = [];
        let page0 = 0;
        for (let file of this.files) {
            this.file2page(file);
            let page = this.pages.length;
            this.file_pages.push({ fullpath: file, name: path.basename(file), page: page0+1, pages: page - page0 });
            page0 = page;
        }

        let pageNo = 1;
        for (let p of this.pages) {
            p.pageNo = pageNo++;
            p.totalPage = this.pages.length;
            this.html += this.page2html(p);
        }
    }

    private file2page(filename: string) {
        let s: string = "";
        let lines: string[];

        // read file => lines

        lines = fs.readFileSync(filename, { encoding: 'utf-8' }).split('\n');

        // lines => wrapped

        let wrapped: Line[] = [];
        let lineNo = 1;

        for (let line of lines) {
            let untab: string = this.untabify(line);
            let len = untab.length;
            let cpl = this.setting.column_per_line;
            for (let i = 0; i <= len; i += cpl) {
                wrapped.push({
                    bFirstLine: i == 0,
                    lineNo: lineNo,
                    text: untab.substring(i, Math.min(len, i + cpl))
                });
            }
            lineNo++;
        }


        let lpp = this.setting.line_per_page;
        for (let i = 0; i < wrapped.length; i += lpp) {
            this.pages.push({
                fileName: path.basename(filename),
                fullPath: filename,
                pageNo: 0,
                totalPage: 0,
                lines: wrapped.slice(i, Math.min(i + lpp, wrapped.length))
            });
        }
    }

    private untabify(line: string): string {
        let col: number = 0;
        let s: string = "";
        for (let c of line) {
            if (c == '\t') {
                do {
                    col++;
                    s += ' ';
                } while (col % this.setting.tab_width);
            } else {
                s += c;
                col++;
            }
        }
        return s;
    }

    private page2html(page: Page): string {
        let c = "";
        for (let line of page.lines) {
            c += htmlGen('div', { class: 'line' },
                ['div', { class: 'lineNo' }, line.bFirstLine ? line.lineNo : ""],
                ['div', { class: 'src-line' }, escape_html(line.text)]
            );
        }
        return htmlGen('div', { class: 'page' , page: page.pageNo},
            ['div', { class: 'header' },
                ['div', { class: 'datetime' }, this.dateTimeStr],
                ['div', { class: 'filename' }, page.fileName]
            ],
            ['div', { class: 'main' }, c],
            ['div', { class: 'footer' },
                ['div', { class: 'fullpath' }, page.fullPath],
                ['div', { class: 'pageNo' }, 'Page.', page.pageNo, '/', page.totalPage]]
        );
    }
}