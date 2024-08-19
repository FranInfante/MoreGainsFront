import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';
import { PlanService } from '../../../../shared/service/plan.service';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent {
  @Input() workouts: Workout[] | null | undefined = null;
  @Input() planId: number | null = null; 
  
  selectedWorkout: Workout | null = null;

  constructor(private planService : PlanService) {}

  showWorkoutDetails(workout: Workout): void {
    this.selectedWorkout = workout;
  }

  closeWorkoutDetails(): void {
    this.selectedWorkout = null;
  }
  deleteExercise(exerciseId: number): void {
    if (this.selectedWorkout && this.planId !== null) {
      this.planService.deleteWorkoutExercise(this.planId, this.selectedWorkout.id, exerciseId).subscribe(() => {
        this.selectedWorkout!.workoutExercises = this.selectedWorkout!.workoutExercises.filter(ex => ex.id !== exerciseId);
      });
    }
  }
}
