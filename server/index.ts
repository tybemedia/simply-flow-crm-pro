import express from 'express';
import cors from 'cors';
import { getEmployees } from './api/employees.js'; // 👈 Achte auf .js (wenn transpiliert)
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks.js';
import { getContacts, createContact, updateContact, deleteContact, getCommentsForContact, addCommentToContact } from './api/contacts.js';
import { getCompanies, createCompany, updateCompany } from './api/companies.js';
import { getDeals, createDeal, updateDeal, deleteDeal } from './api/deals.js';

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

// Contact Routes
app.get('/api/contacts', async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const contacts = await getContacts(companyId);
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching contacts');
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const newContact = await createContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating contact');
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const updatedContact = await updateContact(parseInt(req.params.id), req.body);
    res.json(updatedContact);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating contact');
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await deleteContact(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting contact');
  }
});

// Contact Comment Routes
app.get('/api/contacts/:id/comments', async (req, res) => {
  try {
    const comments = await getCommentsForContact(parseInt(req.params.id));
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching comments');
  }
});

app.post('/api/contacts/:id/comments', async (req, res) => {
  try {
    const newComment = await addCommentToContact(parseInt(req.params.id), req.body);
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding comment');
  }
});

// Company Routes
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await getCompanies();
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching companies');
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const newCompany = await createCompany(req.body);
    res.status(201).json(newCompany);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating company');
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const updatedCompany = await updateCompany(parseInt(req.params.id), req.body);
    res.json(updatedCompany);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating company');
  }
});

// Deal Routes
app.get('/api/deals', async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const deals = await getDeals(companyId);
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching deals');
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const newDeal = await createDeal(req.body);
    res.status(201).json(newDeal);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating deal');
  }
});

app.put('/api/deals/:id', async (req, res) => {
  try {
    const updatedDeal = await updateDeal(parseInt(req.params.id), req.body);
    res.json(updatedDeal);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating deal');
  }
});

app.delete('/api/deals/:id', async (req, res) => {
  try {
    await deleteDeal(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting deal');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
