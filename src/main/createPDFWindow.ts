import { BrowserWindow } from "electron";

class PDFWindow {
    private window: BrowserWindow | null;

    constructor(html: string) {
        this.window = new BrowserWindow({
            webPreferences: { nodeIntegration: true },
            show: false
        });
        this.window.on('closed', () => {
            this.window = null;
        });
        this.window.loadURL(`file://${__dirname}/../../pdf.html`).then(() => {
            if (this.window)
                this.window.webContents.send('html', html);
        });
    }

    public close() {
        if (this.window)
            this.window.close();
    }

    public print() {
        if (this.window)
            this.window.webContents.print();
    }
}

export default PDFWindow;