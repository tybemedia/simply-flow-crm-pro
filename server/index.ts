import express from 'express';
import cors from 'cors';
import { getEmployees } from './api/employees.js'; // 👈 Achte auf .js (wenn transpiliert)

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
