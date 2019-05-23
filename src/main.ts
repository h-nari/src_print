import { BrowserWindow, app, App } from 'electron';
import process from 'process';

class SrcPrintApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/../index.html`

    constructor(app: App) {
        this.app = app;
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this));
        this.app.on('ready', this.create.bind(this));
        this.app.on('activate', this.onActivated.bind(this));
    }

    private onWindowAllClosed() {
        this.app.quit();
    }

    private create() {
        let opt : any = {
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

        console.log(this.mainURL);
        this.mainWindow.loadURL(this.mainURL);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        if (process.env.NODE_ENV == "debug") {
            this.mainWindow.webContents.openDevTools();
        }

    }

    private onReady() {
        this.create();
    }

    private onActivated() {
        if (this.mainWindow == null) {
            this.create();
        }
    }
}

const MyApp: SrcPrintApp = new SrcPrintApp(app);