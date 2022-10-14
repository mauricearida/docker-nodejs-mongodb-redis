const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require("./config/config");

let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    port: REDIS_PORT,
    host: REDIS_URL,
  },
});

redisClient.connect().catch(console.error);

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("succesfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi  Therkssxxxsssslsszzzzssslasdasdke</h2>");
  console.log("yeah it ran");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
//docker volume ls
//(don't forget the "-L" in the package.json)

//docker run -v pathtofolderonlocation:pathtofolderoncontainer -d --name node-app-container node-app-image
//docker run -v /home/maurice/projects/training/docker/nodemongoredis/:/app -d --name node-app-container node-app-image
//docker run -v $(pwd):/app:ro -v /app/node_modules -p 3000:4000 -d --name node-app-container node-app-image
// $(pwd) <= this is only for ubuntu, for windows i think it ss "%cd%"

//HOWEVER, after the use of Docker-compose file, we are not using the commands above anymore

//docker build -t node-app-image .  (the "." here is for the location of the "Dockerfile")
//to check what is inside a file you cat the file "cat index.js"

//docker rm node-app-image -f

//===================================
//===================================
// TO RUN THE WHOLE THING FROM SCRATCH :
//===================================

// 1 - "docker build -t node-app-image ." the "." specifies the location of the Dockerfile

//To clean up everything:
// "docker compose down -v"

//===================================
//===================================
//AFTER ADDING DIFFERENT ENVIRONMENTS :
//===================================
// TO RUN THE WHOLE THING FROM SCRATCH (after done compose environment):
//"docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build"
//the order of the compose config files override each other
//(like javascript yali ba3den 3a yali abel)

//To build a container:
// "docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build"
//  OR    //
// "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
//To erase everything : "docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v"
// "-v" erases the volumes (example db that u kept after deleting a container)
//===================================
//===================================
//AFTER ADDING MONGO CONTAINER :
//===================================

// to get the ip address of a contianer, do "docker inspect ${containre-name}"
// you'll find it in "Networks" => IP address

// 1 - "docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build"
// 2 - docker exec -it ${container-name} mongosh -u "maurice" -p "mypassword"
// 3 - "use mydatabasename"
// 4 - "show dbs"
// 5 - db.books.insertOne({"name":"Harry Potter Book"})
// 6 - db.books.find()
// 7 - then here when doing the compose down you should not add the  "-v" sp the data remains

// after setting the ip address of the mongo container  and saving, it conencts automatically
// to be sure of that you can do "docker inspect ${main-container-name}"
// the word "mongo" in the url in index.js represents the IP adress of the mongo container at anytime
// to check the logs of a container: "docker logs ${container-name} -f"

//====================================
//====================================
//===AFTER SETTING THE DEPENDENCIES===
//====================================

//To get the available commands extensions:
//do: "docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --help"

//To start the "node" container without its dependency "mongo" container
//do: "docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps ${service-name}"

//To enter the redis cli, do: "docker exec -it nodemongoredis-redis-1 redis-cli"
// and then: "KEYS *"
// to get the details of that session: "GET ${key}"

//====================================
//====================================
//===TO CREATE ANOTHER NODE INSTANCE==
//====================================

//1 - you do "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale node-app=2"
