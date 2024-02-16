import { ObjectId } from 'mongodb';
export interface Student {
  _id?: string;
  name: string;
  email: string;
  tax_ident_number: string;
  personal_ident_number: string;
  login: string;
  password: string;
  status?: Status;
  online?: Online;
  course?: ObjectId[];
  lesson_done?: ObjectId[];
  scheduled_lessons?: ObjectId[];
  books?: ObjectId[];
  list_word_text?: ObjectId[];
  gender: string;
  fone_number: string;
  end: string;
  country: string;
  city: string;
  spoken_language: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  tictok: string;
  x: string;
  image_url: string;
  date_create: Date;
  bitcoin?: ObjectId[];
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum Online {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
