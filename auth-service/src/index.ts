import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'; // Fixed import
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import companiesRouter from './cotrollers/companiesController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes); 
app.use('/companies', companiesRouter); 

app.get('/', (_req, res) => res.send("Auth Service is up")); 

const PORT = process.env['PORT'] || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

