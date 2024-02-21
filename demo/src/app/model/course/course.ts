import { Lesson } from '../lesson/lesson';

export interface Course {
  _id: string;
  name: string;
  objective: string;
  content?: Lesson[];
  lessons?: Lesson[];
  category: string;
}
