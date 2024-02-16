import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { PrimeTargetFraseCollection } from '../model/prime/prime-target-frase-collection';

@Injectable({
  providedIn: 'root'
})
export class PrimeTargetFraseService {
  private readonly API = '/api/prime-target-frases';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<PrimeTargetFraseCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<PrimeTargetFraseCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(primeTarget: PrimeTargetFraseCollection) {
    return this.http.post<PrimeTargetFraseCollection>(this.API, primeTarget).pipe(
      first()
    );
  }

  update(primeTarget: PrimeTargetFraseCollection) {
    return this.http.put<PrimeTargetFraseCollection>(`${this.API}/${primeTarget._id}`, primeTarget).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<PrimeTargetFraseCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}
