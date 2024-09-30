import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkoutDataService {
  private workoutId: number | null = null;

  setWorkoutId(id: number): void {
    this.workoutId = id;
  }

  getWorkoutId(): number | null {
    return this.workoutId;
  }
}
