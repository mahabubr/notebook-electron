const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const textArea = document.querySelector("#text");

  ipcRenderer.on("read-file", (event, data) => {
    textArea.value = data;
  });

  ipcRenderer.on("save", async () => {
    await ipcRenderer.invoke("save", textArea.value);
  });

  ipcRenderer.on("save-as", async () => {
    await ipcRenderer.invoke("save-as", textArea.value);
  });

  document.addEventListener("contextmenu", async () => {
    await ipcRenderer.invoke("contextmenu");
  });

  ipcRenderer.on("text", (event, data) => {
    textArea.value = data;
  });

  ipcRenderer.on("copy", async () => {
    const selectedText = document.getSelection().toString();
    await ipcRenderer.invoke("copy", selectedText);
  });
});
