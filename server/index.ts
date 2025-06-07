import express from 'express';
import cors from 'cors';
import { getEmployees } from './api/employees.js'; // 👈 Achte auf .js (wenn transpiliert)
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Hello from the API!');
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await getEmployees();
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching employees');
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching tasks');
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = await createTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating task');
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await updateTask(parseInt(req.params.id), req.body);
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating task');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await deleteTask(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting task');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
