import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkoutDataService {
  
  setWorkoutId(id: number): void {
    localStorage.setItem('workoutId', id.toString());
  }

  getWorkoutId(): number | null {
    const id = localStorage.getItem('workoutId');
    return id ? +id : null;
  }

  clearWorkoutId(): void {
    localStorage.removeItem('workoutId');
  }
}
