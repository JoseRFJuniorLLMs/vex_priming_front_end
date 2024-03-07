import { Lesson } from '../lesson/lesson';

export interface Course {
    _id: string;
    name: string;
    objective: string;
    content: string[];
    category: string;
    level: string;
    price: string;
    status: string;
    lessons: Lesson[];
  }
