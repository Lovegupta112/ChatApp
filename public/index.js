const socket = io();

let username;

document.getElementById("join-chat-btn").addEventListener("click", joinChat);

async function joinChat(event) {
  event.preventDefault();
  username = document.getElementById("username").value.trim();

  if (username) {
    console.log(username);
    document.querySelector(".form-container").style.display = "none";
    document.querySelector('.welcome-screen').style.display='block';
    await welcome();//for 5s welcome screen will show
    document.querySelector('.welcome-screen').style.display='none';
    document.querySelector(".chatroom-container").style.display = "block";
    document.querySelector(
      ".chatroom-header .logo"
    ).innerHTML = 'Chatroom';
    document.querySelector('.chatroom-header .user-info .user').innerText=username;
     //for joining time--
     let hrs = new Date().getHours();
     let min = new Date().getMinutes();
     let time = `${hrs > 12 ? `${hrs - 12}:${min}pm` : `${hrs}:${min}am`}`;
     let data={
      username:username,
      time:time
     }
    socket.emit("join", data); //client emit username with join event and send to server
  }
}


 function welcome(){
  return  new Promise((resolve)=> setTimeout(()=>{
    console.log('welcome to  chatroom');
    resolve();
   },3000));
}

//listen event userJoined event----

socket.on("userJoined", (data) => {
  const { userId, userInfo:{username,time} } = data;
  console.log(data);
  let alertDiv = document.createElement("div");
  alertDiv.innerText = `${username} has Joined at ${time}`;
  alertDiv.setAttribute("class", "user-joined");
  alertDiv.id = userId;
  document.querySelector(".message-container").append(alertDiv);
});

document.getElementById("send-btn").addEventListener("click", sendMessage);
function sendMessage() {
  let message = document
    .querySelector(".message-input-container input")
    .value.trim();
  // console.log(message);
  let hrs = new Date().getHours();
  let min = new Date().getMinutes();
  let time = `${hrs > 12 ? `${hrs - 12}:${min}pm` : `${hrs}:${min}am`}`;
  const data = {
    username: username,
    message: message.length > 0 ? message : null,
    time: time,
  };

  // we emit this with 'message' event and it will inform the server and trigger socket.on with same 'message' event
  socket.emit("message", data);

  //we dont need to depend on socket.io for showing our message , we can directly show what we are sending so we will pass data and true(for sending message)
  addMyMessages(data, true);
}

//if we are receiving message or data , at that time io will emit the data to sockets so we will call socket.on with 'message' event and we will also check that the message must not be sent to that user who sent the messages

socket.on("message", (data) => {
  // console.log('joined',userId);
  if (data.username !== username) {
    addMyMessages(data, false); //it will call addMyMessage for received data
  }
});

//if any user is left then ,at that time io will emit the data to all sockets so we will reveice that event
socket.on("userLeft", (data) => {
  const { userId, userName ,time } = data;
  if(userName){
  let alertDiv = document.createElement("div");
  alertDiv.innerText = `${userName} has Left at ${time}`;
  alertDiv.setAttribute("class", "user-left");
  alertDiv.id = userId;
  console.log(userId, userName);
  document.querySelector(".message-container").append(alertDiv);
  }
});

//this function will append all message to UI (message-container)
function addMyMessages(data, check) {
  let msgDiv = document.createElement("div");
  let message = document.createElement("div");
  let timing = document.createElement("div");
  if (data.message) {
    //it will check message validation
    message.innerText = `${data.username}: ${data.message}`;
    timing.innerText = `${data.time}`;
    timing.className = "timing";
    msgDiv.append(message);
    msgDiv.append(timing);
    if (check) {
      msgDiv.setAttribute("class", "message sent");
    } else {
      msgDiv.setAttribute("class", "message received");
    }
    document.querySelector(".message-container").append(msgDiv);
  }
  document.querySelector(".message-input-container input").value = "";
}
