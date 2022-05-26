const { app, BrowserWindow } = require('electron');
const fs = require('fs');

app.whenReady().then(createWindow);

function createWindow() {
    const win = new BrowserWindow({
        title: 'SimCity Buildit helper',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: 'icon.png',
    });

    win.loadFile('index.html');
    if (!fs.existsSync('./projects.json')) {
        fs.writeFileSync('./projects.json', '[]');
    }
    if (!fs.existsSync('./items.json')) {
        let items = [];
        fs.readdirSync('./images').forEach(item => {
            items.push({
                name: item.replaceAll('.png', ''),
                img: `./images/${item}`,
                inStorage: 0
            });
        });
    }
}
