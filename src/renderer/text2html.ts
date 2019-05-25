import fs from "fs";
import { htmlGen } from "./htmlGen";

export function files2html(files: string[]): string {
    let s: string = "";
    for (let f of files) {
        s += file2html(f);
    }
    return s;
}

export function file2html(file: string): string {
    let html: string = "";

    let data: string = fs.readFileSync(file, { encoding: 'utf-8' });
    let lines: string[] = data.split('\n');
    for (let line of lines) {
        html += line2html(line);
    }
    return html;
}

function line2html(line: string): string {
    let s = "";
    const tab_width = 8;
    let col = 0;

    for (let c of line) {
        if (c == "\t") {
            do col++;
            while (col % tab_width);
        } else {
            s += c;
            col++;
        }
    }
    return htmlGen('div', {class : 'src-line'}, s);
}
