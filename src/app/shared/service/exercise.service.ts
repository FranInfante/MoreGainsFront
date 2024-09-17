import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Exercise } from '../interfaces/exercise';
import { EXERCISES_ROUTES } from '../routes/exercise-routes';
import { MuscleGroup } from '../interfaces/musclegroup';
import { MUSCLEGROUPS_API_URL } from '../routes/musclegroups-routes';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  constructor(private http: HttpClient) {}

  getallExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(EXERCISES_ROUTES.list());
  }

  createOrCheckExercise(newExercise: {
    name: string;
    userId: number;
    description?: string;
    muscleGroup: { id: number };
  }): Observable<{ exercise?: Exercise; exists: boolean }> {
    return this.http.post<{ exercise?: Exercise; exists: boolean }>(
      EXERCISES_ROUTES.createOrCheck(),
      newExercise,
    );
  }
  getMuscleGroups(): Observable<MuscleGroup[]> {
    return this.http.get<MuscleGroup[]>(MUSCLEGROUPS_API_URL);
  }
}
