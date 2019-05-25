import fs from "fs";

export function files2html(files: string[]): string {
    let s : string = "";
    for(let f of files) {
        s += "<div>";
        s += f;
        s += "</div>"
    }
    return s;
}
