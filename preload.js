const { contextBridge } = require('electron')
const crypto = require("crypto");
let child_process = require('child_process')

let processes = {}

contextBridge.exposeInMainWorld('Preload', {
  spawnMecab: () => {
    let child = child_process.spawn("mecab")
    let rand = crypto.randomBytes(16).toString("hex")
    processes[rand] = child;
    return rand
  },
  writeTo: (rand, data) => {
    processes[rand].stdin.write(data);
  },
  endInput: (rand) => {
    processes[rand].stdin.end();
  },
  getOutput: (rand, callback) => {
    processes[rand].stdout.on("data", data => callback(String(data)));
  },
  getError: (rand, callback) => {
    processes[rand].stderr.on("data", data => callback(String(data)));
  },
  onExit: (rand, callback) => {
    processes[rand].on("exit", code => callback(code));
  },
})