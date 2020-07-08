import { NextFunction, Request, Response } from 'express';
import app from './app';
import AppError from './errors/AppError';

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333!');
});
