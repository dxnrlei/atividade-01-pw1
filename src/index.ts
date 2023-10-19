import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

type Technology = {
  id: string;
  title: string;
  deadline: Date;
  created_at: Date;
  studied: boolean;
};

type User = {
  id: string;
  name: string;
  username: string;
  technologies: Technology[];
};

const users = [] as User[];

function checkExistsUserAccount(req: Request, res: Response, next: NextFunction) {
  const { username } = req.headers;

  const userFound = users.find((user) => user.username === username);
  if (!userFound) {
    return res.status(400).json({ error: 'User not found' });
  }
  req.user = userFound;
  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body as User;

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: 'A user with this username already exists' });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    technologies: [],
  };

  users.push(newUser);

  return res.status(201).json(newUser);
});

app.get('/users', checkExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.status(200).json(user);
});

app.post('/technologies', checkExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body as Technology;

  const newTechnology: Technology = {
    id: uuidv4(),
    title,
    studied: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const { user } = req;
  user.technologies.push(newTechnology);

  return res.status(201).json(newTechnology);
});

app.get('/technologies', checkExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.status(200).json(user.technologies);
});

app.put('/technologies/:id', checkExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body as Technology;
  const { id } = req.params;

  const technologyFound: Technology | undefined = req.user.technologies.find((tech) => tech.id === id);
  if (!technologyFound) {
    return res.status(400).json({ error: 'Technology not found' });
  }
  technologyFound.title = title;
  technologyFound.deadline = new Date(deadline);

  return res.status(200).json(technologyFound);
});

app.patch('/technologies/:id/studied', checkExistsUserAccount, (req, res) => {
  const { studied } = req.body as Technology;
  const { id } = req.params;

  const technologyFound: Technology | undefined = req.user.technologies.find((tech) => tech.id === id);
  if (!technologyFound) {
    return res.status(400).json({ error: 'Technology not found' });
  }

  technologyFound.studied = studied;

  return res.status(200).json(technologyFound);
});

app.delete('/technologies/:id', checkExistsUserAccount, (req, res) => {
  const { id } = req.params;

  const technologyFoundIndex = req.user.technologies.findIndex((tech) => tech.id === id);
  if (technologyFoundIndex === -1) {
    return res.status(400).json({ error: 'Technology not found' });
  } else {
    req.user.technologies.splice(technologyFoundIndex, 1);
    return res.status(200).json({ message: 'Technology deleted successfully' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});