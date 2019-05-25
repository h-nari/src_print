interface AttrObj {
    [key: string]: string;
}
type genArg = [string, ...any[]];

export function htmlGen(tag: string, ...args: any): string {
    try {
        let name: string = tag;
        let attr: AttrObj = {};
        let inner = "";
        for (let a of args) {
            let t: string = typeof a;
            if (t == 'string' || t == 'number')
                inner += a;
            else if (t == "object") {
                if (Array.isArray(a)) {
                    if (a.length < 1)
                        throw Error("null array");
                    else if (typeof a[0] != 'string')
                        throw Error("First element must be string");
                    else {
                        let a1 = a.slice(1);
                        inner += htmlGen(a[0], ...a1);
                    }
                } else {
                    for (let k in a) {
                        attr[k] = a[k];
                    }
                }
            }
        }
        let s = '<' + name;
        for (let k in attr)
            s += ` ${k}="${attr[k]}"`;
        s += '>'
        return s + inner + '</' + name + '>';
    } catch (e) {
        console.log('Error htmlGen(%s,%o)', tag, args);
        throw e;
    }
}

