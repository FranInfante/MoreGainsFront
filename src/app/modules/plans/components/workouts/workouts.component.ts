import { Component, Input } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent {
  @Input() workouts: Workout[] | null | undefined = null;
  
  selectedWorkout: Workout | null = null;

  showWorkoutDetails(workout: Workout): void {
    this.selectedWorkout = workout;
  }

  closeWorkoutDetails(): void {
    this.selectedWorkout = null;
  }
}
