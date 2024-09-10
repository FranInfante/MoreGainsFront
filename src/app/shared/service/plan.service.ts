import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plan } from '../interfaces/plan';
import { PLAN_ROUTES } from '../routes/plan-routes';
import { WorkoutExercise } from '../interfaces/workoutexercise';
import { Workout } from '../interfaces/workout';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private http: HttpClient, private userService: UserService) { }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(PLAN_ROUTES.list());
  }

  getPlansByUserId(userId: number): Observable<Plan[]> {
    return this.http.get<Plan[]>(PLAN_ROUTES.byUser(userId));
  }

  getPlanById(id: number): Observable<Plan | undefined> {
    return this.http.get<Plan>(PLAN_ROUTES.update(id));
  }

  addPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(PLAN_ROUTES.create(), plan);
  }

  updatePlan(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(PLAN_ROUTES.update(id), plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(PLAN_ROUTES.delete(id));
  }

  addWorkoutToPlan(planId: number, workout: any): Observable<Plan> {
    return this.http.post<Plan>(PLAN_ROUTES.workouttoplan(planId), workout);
  }
  deleteWorkoutExercise(planId: number, workoutId: number, exerciseId: number): Observable<void> {
    return this.http.delete<void>(PLAN_ROUTES.exerciseInWorkout(planId, workoutId, exerciseId));
  }
  addExerciseToWorkout(planId: number, workoutId: number, workoutExercise: WorkoutExercise): Observable<Workout> {

    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Authorization': `Bearer ${token}`
    });
    

    return this.http.post<Workout>(
      PLAN_ROUTES.addexerciseInWorkout(planId, workoutId),
      workoutExercise,
      { headers: headers } 
    );
  }
  createWorkoutinPlan(planId: number, workout: { name: string }): Observable<Workout> {

    return this.http.post<Workout>(
      PLAN_ROUTES.createWorkoutinPlan(planId),
      workout
    );

  }  
}