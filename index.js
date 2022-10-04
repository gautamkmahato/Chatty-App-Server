const express = require('express');
const app = express();
const httpServer = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); 

app.use(cors()); 

const server = httpServer.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  },
  maxHttpBufferSize: 1e9, //1GB
  pingTimeout: 3000000,
});

app.get('/', (req, res) =>{
  res.send("Welcome to Backend")
})


io.on("connection", (socket) => {
  socket.on('join', (data) =>{
    socket.join(data.roomId);
    socket.emit('sendJoinNotification', { text: `${data.userId}, welcome to room ${data.roomId}.`});
  });

  socket.on('send', (data) =>{
    io.to(data.roomId).emit('receive', {text: data.text, roomId: data.roomId, userId: data.userId});
  });

  socket.on('uploadImage', async(base64, imageObject, callback) => {
    callback({
      status: "ok",
      base64: base64
    });
    io.to(imageObject.roomId).emit("getImageNotification", {
      imageNotification: "Image is received in Server...",
    });
    io.to(imageObject.roomId).emit("getImage", {
        base64: base64,
        roomId: imageObject.roomId,
        userId: imageObject.userId
    });
  });

  socket.on('videoNotification', (data) =>{
    io.to(data.roomId).emit('receiveVideoNotification', {roomId: data.roomId, userId: data.userId});
  })

  socket.on('video', async(data, callback) =>{
    callback({
      status: "Video is received in the server"
    });
    console.log(data.videoData);
    console.log("after video is received")
    io.to(data.roomId).emit('receiveVideo', {videoData: data.videoData, roomId: data.roomId, userId: data.userId});
  });


});

server.listen(4000, () =>{
  console.log('Server is running on PORT 4000...')
});