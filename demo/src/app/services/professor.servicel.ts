import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { ProfessorCollection } from '../model/professor/professor-collection';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private readonly API = '/api/professors';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<ProfessorCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<ProfessorCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(professor: ProfessorCollection) {
    return this.http.post<ProfessorCollection>(this.API, professor).pipe(
      first()
    );
  }

  update(professor: ProfessorCollection) {
    return this.http.put<ProfessorCollection>(`${this.API}/${professor.id}`, professor).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<ProfessorCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}
