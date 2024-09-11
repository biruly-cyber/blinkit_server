import fastify from "fastify";
import { connect } from "./src/config/connect.js";
import dotenv from "dotenv";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

dotenv.config();

const start = async () => {
  //db connection
  await connect();
  //   initialise fastify
  const app = fastify();

  app.register(fastifySocketIO, {
    cors: {
      origin: "*",
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });

  //   register routes
  await registerRoutes(app);

  await buildAdminRouter(app);

  //default connection
  app.get("/", (req, res) => {
    res.send({ message: "Hello World" });
  });

  //   listening db
  app.listen({ port: PORT}, (err, addr) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(addr);
    console.log(
      `server listening on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });

  //   socket io connection
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("a user connected");
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log("user joined room", orderId);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  });
};

start();
