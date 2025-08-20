// src/index.t
import express from "express";
import type {Request, Response} from 'express'
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.json());

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "ok" });
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Employee Service API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'], // Path to your route files with @swagger comments
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(process.env['PORT'] || 3000, () => {
  console.log(`Service running on port ${process.env['PORT'] || 3000}`);
});
