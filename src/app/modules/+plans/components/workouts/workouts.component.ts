import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../../../shared/interfaces/workout';
import { PlanService } from '../../../../shared/service/plan.service';
import { ExercisePickerModalComponent } from '../exercise-picker-modal/exercise-picker-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkoutExercise } from '../../../../shared/interfaces/workoutexercise';
import { ASSET_URLS } from '../../../../shared/components/constants';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css',
})
export class WorkoutsComponent {
  @Input() workouts!: Workout[];
  @Input() planId: number | null = null;
  @Input() isEditing = false;
  @Output() isEditingChange: EventEmitter<boolean> = new EventEmitter();
  @Output() workoutsUpdated = new EventEmitter<Workout[]>();

  workoutForm: FormGroup;
  newWorkout = {
    name: '',
  };
  selectedWorkout: Workout | null = null;
  DeleteIcon: string = ASSET_URLS.DeleteIcon;
  PlusSignIcon: string = ASSET_URLS.PlusSignIcon;

  constructor(
    private planService: PlanService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.workoutForm = this.fb.group({
      workoutName: ['', [Validators.required, Validators.maxLength(20)]],
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
      this.planService
        .deleteWorkoutExercise(this.planId, this.selectedWorkout.id, exerciseId)
        .subscribe(() => {
          this.selectedWorkout!.workoutExercises =
            this.selectedWorkout!.workoutExercises.filter(
              (ex) => ex.id !== exerciseId
            );
        });
    }
  }

  openExercisePickerModal(): void {
    const modalRef = this.modalService.open(ExercisePickerModalComponent, {
      size: 'lg',
    });

    modalRef.result.then(
      (workoutExercise: WorkoutExercise) => {
        if (workoutExercise && this.selectedWorkout && this.planId !== null) {
          this.planService
            .addExerciseToWorkout(
              this.planId,
              this.selectedWorkout.id,
              workoutExercise
            )
            .subscribe((updatedWorkout: Workout) => {
              this.selectedWorkout!.workoutExercises =
                updatedWorkout.workoutExercises;
            });
        }
      },
      () => {}
    );
  }

  createWorkout(): void {
    if (this.workoutForm.valid && this.planId !== null) {
      this.planService
        .createWorkoutinPlan(this.planId, {
          name: this.workoutForm.value.workoutName,
        })
        .subscribe({
          next: (response: Workout) => {
            if (this.workouts) {
              this.workouts.push(response);
            }
            this.modalService.dismissAll();
            this.resetWorkoutForm();
          },
          error: (error: any) => {
            console.error('Error creating workout:', error);
          },
        });
    }
  }

  resetWorkoutForm() {
    this.workoutForm.reset();
  }

  drop(event: CdkDragDrop<Workout[]>) {
    const previousIndex = this.workouts.findIndex(
      (workout) => workout.id === event.item.data.id
    );
    const currentIndex = event.currentIndex;

    if (previousIndex !== -1) {
      moveItemInArray(this.workouts, previousIndex, currentIndex);
    }
  }

  saveReorderedWorkouts() {
    if (this.planId !== null) {
      const workoutIds = this.workouts.map((workout) => workout.id);

      this.planService.reorderWorkouts(this.planId, workoutIds).subscribe({});

      this.isEditing = false;
      this.isEditingChange.emit(this.isEditing);
    }
  }

  deleteWorkout(workoutId: number, event: Event): void {
    // Stop the click event from propagating to the parent elements
    event.stopPropagation();

    if (this.planId !== null) {
      this.planService.deleteWorkout(this.planId, workoutId).subscribe(() => {
        // Remove the deleted workout from the workouts array
        this.workouts = this.workouts.filter(
          (workout) => workout.id !== workoutId
        );
        this.workoutsUpdated.emit(this.workouts);
        // If there are no workouts left, disable edit mode
        if (this.workouts.length === 0) {
          this.isEditing = false;
        }
      });
    }
  }
}
