// Logging
import path from "path";
import { context, trace } from "@opentelemetry/api";
import authentication from "../common-lib/helpers/authentication";
import { addToCache, checkCache } from "../common-lib/helpers/cache";
import customLogger from "../common-lib/middleware/logger";
import config from "../config";

const logger = customLogger(path.basename(__filename));

module.exports = async (app) => {
  //:TODO need to secure these apis too.
  const cache = app.get("redisCache");
  const Todo = await require("../models/todo")(app);

  app.use(function (req, res, next) {
    req.realmName = req.headers.realmname;
    req.redisKey = config.redis.serviceName;
    // let url = req.url.toLowerCase()
    // let allowedUrl = config.application.routesToSkipAuthentication && config.application.routesToSkipAuthentication.filter(p =>{
    //   return url.includes(p.route);
    // })
    // if(allowedUrl && allowedUrl.length > 0 ) {
    //   next();
    // } else {
    authentication(req, res, next);
    // }
  });
  app.use(checkCache);

  app.get("/", (req, res, next) => {
    try {
      req.dbData = `Hello world!`;
      addToCache(req, res, next);
      res.status(200).json(req.dbData).end();
    } catch (e) {
      logger.error(`Error in get ${e}`);
    }
  });

  // Create a new Todo
  app.post("/todos", async (req, res) => {
    try {
      const { description } = req.body;
      const todo = await Todo.create({ description });
      logger.info({ msg: "todo created", todo });
      const { id } = todo;
      const key = `todos_${id}`;
      cache.set(key, JSON.stringify(todo), 60);
      logger.info(`New record cached : ${key}`);
      res.status(201).json(todo);
    } catch (error: any) {
      const span = trace.getSpan(context.active());
      span?.setAttribute("http.request.body", JSON.stringify(req.body));
      span?.recordException(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all Todos
  app.get("/todos", async (req, res) => {
    try {
      const todos = await Todo.findAll();
      res.json(todos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get a specific Todo by ID
  app.get("/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const key = `todos_${id}`;
      const cachedData = await cache.get(key);
      if (cachedData !== null) {
        logger.info(`Cache Hit for ${key}`);
        res.json(JSON.parse(cachedData));
      } else {
        logger.info(`Cache Miss for ${key}`);
        const todo = await Todo.findByPk(id);
        cache.set(key, JSON.stringify(todo), 60);
        res.json(todo);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Update a Todo by ID
  app.put("/todos/:id", async (req, res) => {
    try {
      const { description } = req.body;
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      todo.description = description;
      await todo.save();
      res.json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Delete a Todo by ID
  app.delete("/todos/:id", async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      await todo.destroy();
      res.json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
