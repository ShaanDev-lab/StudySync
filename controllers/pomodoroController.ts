import { Request, Response } from 'express';
import { PomodoroModel } from '../models/pomodoroModel.js';

export const logSession = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const { taskId, durationMinutes } = req.body;

    if (!taskId || !durationMinutes) {
      return res.status(400).json({ message: 'taskId and durationMinutes are required' });
    }

    const sessionId = await PomodoroModel.logSession(Number(taskId), Number(userId), Number(durationMinutes));
    res.status(201).json({ message: 'Pomodoro session logged successfully', sessionId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyStats = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const stats = await PomodoroModel.getWeeklyStats(Number(userId));
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
