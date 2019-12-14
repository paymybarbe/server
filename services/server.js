const { app, BrowserWindow } = require("electron");
// const debug = require("debug")("server:service:server");
const path = require("path");
const tls = require("tls");
const fs = require("fs");
const config = require("../config/config");

const certs_folder = (config.server.certs_folder === undefined) ? path.resolve(process.env.APP_RESOURCES, "certs/") : path.resolve(process.env.APP_RESOURCES, "certs/", config.server.certs_folder);

const options = {
    key: fs.readFileSync(path.resolve(certs_folder, "server-key.pem")),
    cert: fs.readFileSync(path.resolve(certs_folder, "server-crt.pem")),
    ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")),
    requestCert: true,
    rejectUnauthorized: true
};

const server = tls.createServer(options, (socket) => {
    console.log("server connected", socket.authorized ? "authorized" : "unauthorized");
    socket.write("welcome!\n");
    socket.setEncoding("utf8");
    socket.pipe(socket);
});

server.listen(config.server.port, () => {
    console.log("server bound");
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile(path.resolve(process.env.APP_RESOURCES, "index.html"));

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    server.close();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
