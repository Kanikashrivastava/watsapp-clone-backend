//importing
let express = require("express");
let mongoose = require("mongoose");
const Messages = require("./dbMessages");
const Pusher = require("pusher");
const cors = require('cors');

// api config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1204120",
  key: "74ecd5be943cb4ab956e",
  secret: "db854d7e0c8b298007cc",
  cluster: "ap2",
  useTLS: true,
});

//middleware

app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', '*');
//   next();
// })

//DB Config
const connection_url =
  "mongodb+srv://admin:SCzIXV0b8AJNRJff@cluster0.1z1io.mongodb.net/watsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received
      });
    } else {
      console.log('Error triggring pusher');
    }
  });
});

//????

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

//listen
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
