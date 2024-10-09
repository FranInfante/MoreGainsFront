import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkoutDataService {

  
  setWorkoutId(id: number): void {
    localStorage.setItem('currentWorkoutId', id.toString());
  }

  getWorkoutId(): number | null {
    const workoutId = localStorage.getItem('currentWorkoutId');
    return workoutId ? parseInt(workoutId, 10) : null;
  }

  clearWorkoutId(): void {
    localStorage.removeItem('currentWorkoutId');
  }
}
