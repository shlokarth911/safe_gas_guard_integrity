console.log("object");
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Listen for 'dataUpdate' events from the server
  socket.on("dataUpdate", (data) => {
    // Update the existing card elements with new data
    document.getElementById("connectivity-status").innerText = data.connection
      ? "Connected"
      : "Disconnected";
    document.getElementById("gas-level").innerText = data.gasLevel;
    document.getElementById("power-status").innerText = data.powerStatus
      ? "ON"
      : "OFF";
  });

  // Listen for 'notification' events from the server
  socket.on("notification", (message) => {
    // Check if notifications are permitted
    if (Notification.permission === "granted") {
      new Notification("Gas Level Alert", {
        body: `${message} The current gas level is ${
          document.getElementById("gas-level").innerText
        }`,
        icon: "/SVGs/Warning.svg",
      });
    }
  });

  console.log("Client-side script loaded and socket initialized");
});
