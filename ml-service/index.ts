// src/index.t
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Service running on port ${process.env.PORT || 3000}`);
});
