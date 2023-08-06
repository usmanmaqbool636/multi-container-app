const express = require("express");
const Todo = require("./../models/Todo");
const { client } = require("../services/redis");

const router = express.Router();
const KEY = "TODOS";
async function getTodos() {
  try {
    const jsonString = await client.get(KEY);
    if (jsonString) {
      const jsonData = JSON.parse(jsonString);
      console.log("from redis");
      return jsonData;
    } else {
      console.log("from db");
      const todos = await Todo.find();
      storeJsonDataWithExpiry(KEY, todos);
      return todos;
    }
  } catch (error) {
    console.error("Error retrieving JSON data from Redis:", error);
    return null;
  }
}

async function storeJsonDataWithExpiry(key, data, expiryInSeconds = 100) {
  try {
    const jsonString = JSON.stringify(data);
    await client.setex(key, expiryInSeconds, jsonString);
    console.log("JSON data stored");
  } catch (error) {
    console.error("Error storing JSON data in Redis:", error);
  }
}
// Home page route
router.get("/", async (req, res) => {
  const todos = await getTodos();
  return res.json({
    total: todos.length,
  });
});

// POST - Submit Task
router.post("/", async (req, res) => {
  const newTask = new Todo({
    task: req.body.task,
    created_at: Date.now(),
  });

  newTask
    .save()
    .then((task) => {})
    .catch((err) => console.log(err));
  res.end();
  await client.del(KEY);
});

// POST - Destroy todo item
router.post("/todo/destroy", async (req, res) => {
  const taskKey = req.body._key;
  const err = await Todo.findOneAndRemove({ _id: taskKey });
  res.redirect("/");
});

module.exports = router;
