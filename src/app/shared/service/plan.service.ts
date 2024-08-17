import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plan } from '../interfaces/plan';
import { PLAN_ROUTES } from '../routes/plan-routes';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private http: HttpClient) { }

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
  deleteWorkoutExercise(workoutId: number, exerciseId: number): Observable<void> {
  return this.http.delete<void>(`${PLAN_ROUTES.workouttoplan(workoutId)}/exercise/${exerciseId}`);
}
}