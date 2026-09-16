export type Priority = 'Low' | 'Medium' | 'High';
export type TaskType = 'Assignment' | 'Exam' | 'Lab' | 'Viva';
export type Status = 'Pending' | 'Completed' | 'In Progress';

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  deadline: string;
  priority: Priority;
  status: Status;
}

export interface Collision {
  taskId1: string;
  taskId2: string;
  reason: string;
}
