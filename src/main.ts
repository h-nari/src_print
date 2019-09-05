import { BrowserWindow, app, App, dialog, ipcMain, session } from 'electron';
import process from 'process';
import fs from 'fs';
import setAppMenu from "./setAppMenu";
import PDFWindow from "./createPDFWindow";

class SrcPrintApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/../index.html`
    public argv: string[];

    constructor(app: App) {
        this.app = app;
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this));
        this.app.on('ready', this.create.bind(this));
        this.app.on('activate', this.onActivated.bind(this));
        if (process.env.NODE_ENV == 'debug') {
            let i = process.argv.lastIndexOf(".");
            if (i >= 0)
                this.argv = process.argv.slice(i + 1);
            else
                this.argv = process.argv.slice(0);
        } else {
            this.argv = process.argv.slice(1);
        }
    }

    private onWindowAllClosed() {
        if (session.defaultSession && session.defaultSession.clearCache)
            session.defaultSession.clearCache(() => { });
        this.app.quit();
    }

    private create() {
        let opt: any = {
            width: 800,
            height: 1000,
            minWidth: 500,
            minHeight: 200,
            acceptFirstMouse: true,
            titleBarStyle: 'hidden',
            webPreferences: {
                nodeIntegration: true,
            }
        };
        if (process.env.NODE_ENV == "debug") {
            opt.x = 1920 + 5;
            opt.y = 5;
        }
        this.mainWindow = new BrowserWindow(opt);
        this.mainWindow.webContents.send('print', this.mainURL);
        this.mainWindow.webContents.send('print', process.argv);

        this.mainWindow.loadURL(this.mainURL);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        if (process.env.NODE_ENV == "debug") {
            this.mainWindow.webContents.openDevTools();
        }
        setAppMenu({
            openFile: () => {
                let files: string[] | undefined =
                    dialog.showOpenDialog({
                        title: 'ファイルを開く',
                        properties: ['openFile', 'multiSelections'],
                        filters: [
                            { name: 'All Files', extensions: ["*"] },
                            { name: 'Text', extensions: ["txt"] },
                            { name: 'Source Files', extensions: ["c", "cpp", "h", "js", "ts"] }
                        ]
                    });
                if (files && this.mainWindow) {
                    this.mainWindow.webContents.send("openFile", files);
                }
            },
            appQuit: () => {
                this.app.quit();
            },
            print: async () => {
                let pdfWin: PDFWindow = await this.preparePdfWin();
                pdfWin.print();
            }
        });
    }

    private onReady() {
        this.create();

    }

    private onActivated() {
        if (this.mainWindow == null) {
            this.create();
        }
    }

    private preparePdfWin(): Promise<PDFWindow> {
        return new Promise((resolve, reject) => {
            var pdfWin: PDFWindow | null = null;
            ipcMain.once("html", (event, html: string) => {
                pdfWin = new PDFWindow(html);
            });

            if (this.mainWindow)
                this.mainWindow.webContents.send("html");
            else reject("mainWindow null");
            ipcMain.once("pdfWinReady", (event, arg) => {
                if (pdfWin)
                    resolve(pdfWin);
                else
                    reject("pdfWin null");
            });
        });
    }
}

const MyApp: SrcPrintApp = new SrcPrintApp(app);

ipcMain.on('get_arg', (event, arg) => {
    event.sender.send('arg', MyApp.argv);
})
