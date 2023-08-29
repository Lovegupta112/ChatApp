// console.log('testing our server ...');

// importing express----------
const express = require("express");

//setting up our express and it allows to create server
const app = express();

//importing http protocol and linking  our express app to that protocol and creating a server ---
const server = require("http").Server(app);

//giving public folder to my express app----
app.use(express.static("public"));

// importing socket.io and linking it with server-------
const io = require("socket.io")(server);

const activeUsers = new Map(); //for storing activeUsers

io.on("connection", (socket) => {
  //io gives to each client socket
  console.log("connection eastablished ", socket.id);

  // if user joins --
  //user sent join event with desired data and the server emits a userJoined event to notify all connected clients about new user joining;
  socket.on("join", (data) => {
    console.log("user joined : ");
    activeUsers.set(socket.id, data.username);
    io.emit("userJoined", { userId: socket.id, userInfo:{...data} });
  });

  socket.on("message", (data) => {
    //when client send message so it gives to io
    // io.emit('message',data); //io will emit this message to all other sockets
    io.emit("message", data); //io will emit this message to all other sockets
  });

  // if socket is disconnected
  socket.on("disconnect", () => {
    console.log("User left the chat");
    const userName = activeUsers.get(socket.id);
    activeUsers.delete(socket.id); //we wil remove that user from activeUsers
   
   
    let hrs = new Date().getHours();
    let min = new Date().getMinutes();
    let time = `${hrs > 12 ? `${hrs - 12}:${min}pm` : `${hrs}:${min}am`}`;

    let data={
        userId: socket.id,
         userName: userName,
         time:time
    }
    io.emit("userLeft",data); //it will emit  with an event userLeft and it will notify to other clients(sockets)
  });
});

//in this port , our server will run
const PORT = 9003;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // console.log('happy coding....');
});
