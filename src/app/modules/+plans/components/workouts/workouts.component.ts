import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';
import { PlanService } from '../../../../shared/service/plan.service';
import { ExercisePickerModalComponent } from '../exercise-picker-modal/exercise-picker-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkoutExercise } from '../../../../shared/interfaces/workoutexercise';
import { ASSET_URLS } from '../../../../shared/components/constants';

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
  DeleteIcon : string = ASSET_URLS.DeleteIcon;
  PlusSignIcon : string = ASSET_URLS.PlusSignIcon;

  constructor(
    private planService: PlanService,
    private modalService: NgbModal
  ) {
  }

  showWorkoutDetails(workout: Workout): void {
    this.selectedWorkout = workout;
    document.body.classList.add('modal-open');
  }

  closeWorkoutDetails(): void {
    this.selectedWorkout = null;
    document.body.classList.remove('modal-open');
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
  
    modalRef.result.then((workoutExercise: WorkoutExercise) => {
      if (workoutExercise && this.selectedWorkout && this.planId !== null) {
        this.planService.addExerciseToWorkout(this.planId, this.selectedWorkout.id, workoutExercise).subscribe((updatedWorkout: Workout) => {
          this.selectedWorkout!.workoutExercises = updatedWorkout.workoutExercises;
        });
      }
    }, () => {});
  }
}
