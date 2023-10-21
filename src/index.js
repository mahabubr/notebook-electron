const {
  BrowserWindow,
  app,
  Menu,
  dialog,
  ipcMain,
  clipboard,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
const createWidow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(app.getAppPath(), "src", "preload.js"),
    },
  });

  mainWindow.loadFile("src/index.html");
};

let openFilePath = "";

const menuItems = [
  {
    label: "File",
    submenu: [
      {
        label: "Open",
        click: async () => {
          const { canceled, filePaths } = await dialog.showOpenDialog();
          if (!canceled) {
            openFilePath = filePaths[0];
            fs.readFile(openFilePath, (error, data) => {
              if (error) {
                return console.log(error);
              } else {
                const getData = data.toString();
                mainWindow.webContents.send("read-file", getData);
              }
            });
          }
        },
        accelerator: "CmdOrCtrl+O",
      },
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click: () => {
          mainWindow.webContents.send("save");
        },
      },
      {
        label: "Save As",
        accelerator: "CmdOrCtrl+Shift+S",
        click: () => {
          mainWindow.webContents.send("save-as");
        },
      },
      {
        label: "Exit",
      },
    ],
  },
  {
    label: "Insert",
  },
  {
    label: "Edit",
  },
];

const appMenu = Menu.buildFromTemplate(menuItems);

Menu.setApplicationMenu(appMenu);

const saveFile = (filePath, data) => {
  fs.writeFile(filePath, data, (error) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Saved");
    }
  });
};

ipcMain.handle("save", async (event, data) => {
  if (openFilePath === "") {
    const { canceled, filePath } = await dialog.showSaveDialog();
    if (!canceled) {
      openFilePath = filePath;
    } else {
      return null;
    }
  }

  saveFile(openFilePath, data);
});

ipcMain.handle("save-as", async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog();

  if (!canceled) {
    saveFile(filePath, data);
  }
});

const contextMenuTemplate = [
  {
    label: "copy",
    click: () => {
      mainWindow.webContents.send("copy");
    },
    accelerator: "CmdOrCtrl+C",
  },
  {
    label: "paste",
    click: () => {
      const text = clipboard.readText();
      mainWindow.webContents.send("text", text);
    },
    accelerator: "CmdOrCtrl+V",
  },
];

app.whenReady().then(() => {
  createWidow();

  app.on("browser-window-focus", () => {
    globalShortcut.register("CmdOrCtrl+Shift+M", () => {
      console.log("Presses");
    });
  });

  app.on("browser-window-blur", () => {
    globalShortcut.unregister("CmdOrCtrl+Shift+M");
  });

  mainWindow.webContents.openDevTools();
});

ipcMain.handle("contextmenu", (event) => {
  const webContent = event.sender;

  const window = BrowserWindow.fromWebContents(webContent);

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
  contextMenu.popup(window);

  console.log(mainWindow.webContents);
});

ipcMain.handle("copy", (event, data) => {
  clipboard.writeText(data);
});
