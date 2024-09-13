import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';
import { PlanService } from '../../../../shared/service/plan.service';
import { ExercisePickerModalComponent } from '../exercise-picker-modal/exercise-picker-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkoutExercise } from '../../../../shared/interfaces/workoutexercise';
import { ASSET_URLS } from '../../../../shared/components/constants';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent {
  @Input() workouts!: Workout[];
  @Input() planId: number | null = null;
  @Input() isEditing = false;
  
  workoutForm: FormGroup;
  newWorkout = {
    name: ''
  };
  selectedWorkout: Workout | null = null;
  DeleteIcon : string = ASSET_URLS.DeleteIcon;
  PlusSignIcon : string = ASSET_URLS.PlusSignIcon;
  unsavedChanges = false;
  

  constructor(
    private planService: PlanService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.workoutForm = this.fb.group({
      workoutName: ['', [Validators.required, Validators.maxLength(20)]]
    });
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

  createWorkout(): void {
    if (this.workoutForm.valid && this.planId !== null) {
      this.planService.createWorkoutinPlan(this.planId, { name: this.workoutForm.value.workoutName }).subscribe({
        next: (response: Workout) => {
          if (this.workouts) {
            this.workouts.push(response);
          }
          this.modalService.dismissAll();
          this.resetWorkoutForm();
        },
        error: (error: any) => {
          console.error('Error creating workout:', error);
        }
      });
    }
  }

  resetWorkoutForm() {
    this.workoutForm.reset();
  }

  drop(event: CdkDragDrop<Workout[]>) {
    const previousIndex = this.workouts.findIndex(workout => workout.id === event.item.data.id);
    const currentIndex = event.currentIndex;

    if (previousIndex !== -1) {
      moveItemInArray(this.workouts, previousIndex, currentIndex);
      this.unsavedChanges = true;
    }
  }

  saveReorderedWorkouts() {
    if (this.unsavedChanges && this.planId !== null) {
      const workoutIds = this.workouts.map(workout => workout.id);

      this.planService.reorderWorkouts(this.planId, workoutIds).subscribe({
        next: () => {
          this.unsavedChanges = false;
        },
        error: (error) => {
          console.error('Error reordering workouts:', error);
        }
      });

      this.isEditing = !this.isEditing;
    }
  }
}
