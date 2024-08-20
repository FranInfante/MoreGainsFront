import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';
import { PlanService } from '../../../../shared/service/plan.service';
import { Exercise } from '../../../../shared/interfaces/exercise';
import { ExercisePickerModalComponent } from '../exercise-picker-modal/exercise-picker-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkoutExercise } from '../../../../shared/interfaces/workoutexercise';

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

  constructor(private planService: PlanService, private modalService: NgbModal) {}

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

  openExercisePickerModal(): void {
    const modalRef = this.modalService.open(ExercisePickerModalComponent, { size: 'lg' });

    modalRef.componentInstance.initializeExercises();

    modalRef.result.then((exercise: Exercise) => {
      if (exercise && this.selectedWorkout && this.planId !== null) {
        const workoutExercise: WorkoutExercise = { 
          id: 0,
          exerciseName: exercise.name, 
          reps: 10, 
          sets: 3, 
          weight: 50,
          workout: this.selectedWorkout
        };
        this.planService.addExerciseToWorkout(this.planId!, this.selectedWorkout.id, workoutExercise).subscribe((updatedWorkout: Workout) => {
          this.selectedWorkout!.workoutExercises = updatedWorkout.workoutExercises;
        });
      }
    }, () => {
    });
  }
}
