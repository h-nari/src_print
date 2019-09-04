import { Menu } from "electron";

function setAppMenu(options: any) {
    const template: Electron.MenuItemOptions[] = [
        {
            label: "File",
            submenu: [
                { label: 'Open File',   click: () => { options.openFile(); } },
                { label: 'Print',       click: () => { options.print(); } },
                { label: 'Export PDF',  click: () => { options.exportPDF(); } },
                { type: 'separator' },
                { label: 'Quit',        click: () => { options.appQuit(); } }
            ]
        },
        {
            label: "View",
            submenu: [
                { role: 'reload' },
                { role: 'toggledevtools' }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

export default setAppMenu;
