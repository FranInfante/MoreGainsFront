import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Exercise } from '../interfaces/exercise';
import { EXERCISES_ROUTES } from '../routes/exercise-routes';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  constructor(private http: HttpClient) { }

  getallExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(EXERCISES_ROUTES.list());
  }

}