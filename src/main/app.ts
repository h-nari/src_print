import { BrowserWindow, app, App, dialog, ipcMain, session } from 'electron';
import process from 'process';
import fs from 'fs';
import setAppMenu from "./setAppMenu";
import PDFWindow from "./createPDFWindow";
import TypeSetter from "./typesetter";

class SrcPrintApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/../../mainWin.html`
    private ts: TypeSetter = new TypeSetter();
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
            opt.x = 1920 * 1 + 5;
            opt.y = 5;
        }
        this.mainWindow = new BrowserWindow(opt);
        this.mainWindow.loadURL(this.mainURL).then(() => {
            this.addFiles(this.argv);
        });
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
                            { name: 'Text', extensions: ["txt", "csv", "md", "json", "html"] },
                            { name: 'Source Files', extensions: ["c", "cpp", "h", "js", "ts"] }
                        ]
                    });
                if (files && this.mainWindow) {
                    this.addFiles(files);
                }
            },
            appQuit: () => {
                this.app.quit();
            },
            print: async () => {
                let pdfWin: PDFWindow = await this.preparePdfWin();
                pdfWin.print();
            },
            refresh: () => {
                this.refresh();
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
            var pdfWin: PDFWindow = new PDFWindow(this.ts.getHtml());
            ipcMain.once("pdfWinReady", (event, arg) => {
                resolve(pdfWin);
            });
        });
    }

    public addFile(path: string) {
        this.ts.addFile(path);
        this.refresh();
    }

    public addFiles(files: string[]) {
        console.log("addFiles:", files);
        for (let file of files)
            this.ts.addFile(file);
        this.refresh();
    }

    public resetFiles(files: string[]) {
        console.log("resetFiles:", files);
        this.ts.resetFiles();
        this.addFiles(files);
    }

    public refresh() {
        this.ts.typeset();
        if (this.mainWindow) {
            this.mainWindow.webContents.send('html', this.ts.getHtml());
            this.mainWindow.webContents.send('pages', this.ts.getPages());
            this.mainWindow.webContents.send('files', this.ts.getFiles());
        }
    }
}

const MyApp: SrcPrintApp = new SrcPrintApp(app);

ipcMain.on('addFile', (event, arg: string) => {
    MyApp.addFile(arg);
});

ipcMain.on('reloaded', (event, arg) => {
    MyApp.refresh();
});

ipcMain.on('change-filelist', (event, files: string[]) => {
    MyApp.resetFiles(files);
});
