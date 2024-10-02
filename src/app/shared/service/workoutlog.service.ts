import { Injectable } from '@angular/core';
import { WORKOUT_LOG_ROUTES } from '../routes/workout-log-routes';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutLogService {
  constructor(private http: HttpClient) {}

  getAllWorkoutLogs(): Observable<any[]> {
    return this.http.get<any[]>(WORKOUT_LOG_ROUTES.list());
  }

  createWorkoutLog(workoutLog: any): Observable<any> {
    return this.http.post<any>(WORKOUT_LOG_ROUTES.create(), workoutLog);
  }

  updateWorkoutLog(workoutLogId: number, workoutLog: any): Observable<any> {
    return this.http.put<any>(WORKOUT_LOG_ROUTES.update(workoutLogId), workoutLog);
  }

  deleteWorkoutLog(workoutLogId: number): Observable<void> {
    return this.http.delete<void>(WORKOUT_LOG_ROUTES.delete(workoutLogId));
  }

  getWorkoutLogByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(WORKOUT_LOG_ROUTES.byUser(userId));
  }

  getWorkoutLogById(workoutLogId: number): Observable<any> {
    return this.http.get<any>(WORKOUT_LOG_ROUTES.getById(workoutLogId));
  }

  addWorkoutLogExercise(workoutLogExercise: any): Observable<any> {
    return this.http.post<any>(WORKOUT_LOG_ROUTES.createExercise(), workoutLogExercise);
  }

  updateWorkoutLogExercise(exerciseId: number, workoutLogExercise: any): Observable<any> {
    return this.http.put<any>(WORKOUT_LOG_ROUTES.updateExercise(exerciseId), workoutLogExercise);
  }

  deleteWorkoutLogExercise(exerciseId: number): Observable<void> {
    return this.http.delete<void>(WORKOUT_LOG_ROUTES.deleteExercise(exerciseId));
  }

  getWorkoutLogByUserIdAndIsEditing(userId: number, isEditing: boolean): Observable<any> {
    return this.http.get<any>(
      `${WORKOUT_LOG_ROUTES.byUser(userId)}?isEditing=${isEditing}`
    );
  }

  getExerciseById(exerciseId: number): Observable<any> {
    return this.http.get<any>(WORKOUT_LOG_ROUTES.exerciseById(exerciseId));
  }
}
