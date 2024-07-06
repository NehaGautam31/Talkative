var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var port = process.env.PORT || 5000

app.use(cors());
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var dbUrl = 'mongodb+srv://user1:user1@mongo-node.g2fdf3p.mongodb.net/';

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        console.log("Fetched messages:", messages);
        res.send(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.sendStatus(500);
    }
});

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
        await message.save();
        console.log("Message saved:", req.body);
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error("Error saving message:", err);
        res.sendStatus(500);
    }
});

io.on('connection', (socket) => {
    console.log('user connected');
});

async function connectDB() {
    try {
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('mongodb connection successful');
    } catch (error) {
        console.error('mongodb connection error:', error);
    }
}

connectDB();

var server = http.listen(port, () => {
    console.log("Server is listening on port %d", port);
});