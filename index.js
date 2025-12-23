const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, "tasks.json");

// ✅ Safe read
const readTasks = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

// ✅ Write file
const writeTasks = (tasks) => {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

// GET all tasks
app.get("/tasks", (req, res) => {
  res.json(readTasks());
});

// ADD task
app.post("/tasks", (req, res) => {
  const tasks = readTasks();

  const task = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description || "",
    priority: req.body.priority || "normal",
    completed: req.body.completed ?? false
  };

  tasks.push(task);
  writeTasks(tasks);

  res.status(201).json(task);
});

// ✅ UPDATE task (CORRECT)
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const tasks = readTasks();

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks[index] = {
    ...tasks[index],
    title: req.body.title ?? tasks[index].title,
    description: req.body.description ?? tasks[index].description,
    priority: req.body.priority ?? tasks[index].priority,
    completed: req.body.completed ?? tasks[index].completed
  };

  writeTasks(tasks);

  // ✅ IMPORTANT: return updated task
  res.json(tasks[index]);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const tasks = readTasks().filter(t => t.id !== id);
  writeTasks(tasks);

  res.json({ message: "Task deleted" });
});


app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});



