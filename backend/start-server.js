#!/usr/bin/env node

// Start the backend server
const { spawn } = require("child_process");
const path = require("path");

const serverPath = path.join(__dirname, "server.js");
const server = spawn("node", [serverPath], {
  stdio: "inherit",
  cwd: __dirname,
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
});

server.on("exit", (code) => {
  console.log(`Server exited with code ${code}`);
});

console.log("Starting SAK Platform backend server...");
