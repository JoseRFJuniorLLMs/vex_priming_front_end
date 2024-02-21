import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, of, tap } from 'rxjs';
import { AppConfigurl } from 'src/app/app-config_url';

import { Course } from '../model/course/course';
import { CoursePage } from '../model/course/course-page';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private readonly API = AppConfigurl.urlCourse2;

  private cache: Course[] = [];

  constructor(private http: HttpClient) { }

  list(page = 0, pageSize = 10) {
    return this.http.get<CoursePage>(this.API, { params: { page, pageSize } }).pipe(
      first(),
      //map(data => data.courses),
      tap(data => (this.cache = data.courses))
    );
  }

  loadById(id: string) {
    if (this.cache.length > 0) {
      const record = this.cache.find(course => `${course._id}` === `${id}`);
      return record != null ? of(record) : this.getById(id);
    }
    return this.getById(id);
  }

  private getById(id: string) {
    return this.http.get<Course>(`${this.API}/${id}`).pipe(first());
  }

  save(record: Partial<Course>) {
    if (record._id) {
      return this.update(record);
    }
    return this.create(record);
  }

  private update(record: Partial<Course>) {
    return this.http.put<Course>(`${this.API}/${record._id}`, record).pipe(first());
  }

  private create(record: Partial<Course>) {
    return this.http.post<Course>(this.API, record).pipe(first());
  }

  remove(id: string) {
    return this.http.delete<Course>(`${this.API}/${id}`).pipe(first());
  }
}
