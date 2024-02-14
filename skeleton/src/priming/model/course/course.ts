import { Lesson } from '../lesson/lesson';

export interface Course {
  _id: string;
  name: string;
  objective: string;
  content?: Lesson[]; // TODO: remove, e atualizar(ContentCollection)
  lessons?: Lesson[];
  category: string;
}
