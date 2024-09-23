import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASSET_URLS, MSG, TOAST_MSGS } from '../../../../shared/components/constants';
import { Workout } from '../../../../shared/interfaces/workout';
import { WorkoutExercise } from '../../../../shared/interfaces/workoutexercise';
import { PlanService } from '../../../../shared/service/plan.service';
import { ExercisePickerModalComponent } from '../exercise-picker-modal/exercise-picker-modal.component';
import { CreateExerciseModalComponent } from '../create-exercise-modal/create-exercise-modal.component';
import { ToastService } from '../../../../shared/service/toast.service';

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
   @Output() workoutNameUpdated = new EventEmitter<Workout>();

  @ViewChild('exerciseList') exerciseList!: ElementRef;

  workoutForm: FormGroup;
  newWorkout = {
    name: '',
  };
  selectedWorkout: Workout | null = null;
  DeleteIcon: string = ASSET_URLS.DeleteIcon;
  PlusSignIcon: string = ASSET_URLS.PlusSignIcon;
  workoutsMarkedForDeletion: Workout[] = [];

  maxLen = 20;
  specialKeys = ['Backspace', 'Shift', 'Control', 'Alt', 'Delete'];
  navigationalKeys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

  constructor(
    private planService: PlanService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.workoutForm = this.fb.group({
      workoutName: ['', [Validators.required, Validators.maxLength(20)]],
    });
  }
  showExerciseOptions = false;

  markWorkoutForDeletion(workout: Workout): void {
    this.workoutsMarkedForDeletion.push(workout);

    // Filter out the marked workout from the displayed list without actually deleting it yet
    this.workouts = this.workouts.filter(w => w.id !== workout.id);
    this.workoutsUpdated.emit(this.workouts);
  }

  openExerciseOptions(): void {
    this.showExerciseOptions = !this.showExerciseOptions;
  }

  openExercisePickerModal(): void {
    const modalRef = this.modalService.open(ExercisePickerModalComponent, {
      size: 'lg',
    });
    
    modalRef.componentInstance.planId = this.planId!;
    modalRef.componentInstance.workoutId = this.selectedWorkout!.id;
    modalRef.result.then((workoutExercise: WorkoutExercise) => {
      if (workoutExercise && this.selectedWorkout) {
        this.planService.addExerciseToWorkout(
          this.planId!,
          this.selectedWorkout.id,
          workoutExercise
        ).subscribe((updatedWorkout: Workout) => {
          this.selectedWorkout!.workoutExercises = updatedWorkout.workoutExercises;
          setTimeout(() => {
            this.scrollToLastExercise();
          }, 100);
        });
      }
    }, () => {});
  }

  openCreateExerciseModal(): void {
    const modalRef = this.modalService.open(CreateExerciseModalComponent, {
      size: 'lg',
    });
  
    modalRef.componentInstance.planId = this.planId!;
    modalRef.componentInstance.workoutId = this.selectedWorkout!.id;
  
    modalRef.result.then((newExercise) => {
   
      if (newExercise && this.selectedWorkout) {
        this.selectedWorkout!.workoutExercises.push(newExercise);
   
        // Add to backend
        this.planService.addExerciseToWorkout(
          this.planId!,
          this.selectedWorkout.id,
          newExercise
        ).subscribe((updatedWorkout: Workout) => {
          this.selectedWorkout!.workoutExercises = updatedWorkout.workoutExercises;
          this.scrollToLastExercise();
        });
      }
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
              this.workoutsUpdated.emit(this.workouts);
              this.isEditingChange.emit(this.isEditing);
            }
  
            this.modalService.dismissAll();
            this.resetWorkoutForm();
          },
          error: (error: any) => {
            console.error(MSG.errorcreatingworkout, error);
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
    
      // Reorder the remaining workouts
      this.planService.reorderWorkouts(this.planId, workoutIds).subscribe(() => {
        // Check if any workouts are marked for deletion
        if (this.workoutsMarkedForDeletion.length > 0) {
          // Send delete requests for workouts marked for deletion
          this.workoutsMarkedForDeletion.forEach(workout => {
            this.planService.deleteWorkout(this.planId!, workout.id).subscribe(() => {
              // Optionally handle response or errors
            });
          });
    
          // Show a toast message after successfully saving changes if any workout was deleted
          this.toastService.showToast(TOAST_MSGS.workoutdeletedsaved, 'success');
    
          // Clear the deletion list after the changes are saved
          this.workoutsMarkedForDeletion = [];
        }
    
        // Update UI and reset editing mode
        this.isEditing = false;
        this.isEditingChange.emit(this.isEditing);
      });
    }
  }

  deleteWorkout(workoutId: number, event: Event): void {
    event.stopPropagation();
  
    if (this.planId !== null) {
      this.planService.deleteWorkout(this.planId, workoutId).subscribe(() => {
        this.workouts = this.workouts.filter((workout) => workout.id !== workoutId);
  
        this.workoutsUpdated.emit(this.workouts);
  
        if (this.workouts.length === 0) {
          this.isEditing = false;
          this.isEditingChange.emit(this.isEditing);
        }
      });
    }
  }

  scrollToLastExercise(): void {
  if (this.exerciseList) {
    const lastExerciseElement = this.exerciseList.nativeElement.lastElementChild;
    if (lastExerciseElement) {
      lastExerciseElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

    }
  }
   
}

updateWorkoutName(): void {
  if (!this.selectedWorkout) return; // Add null check

  const inputElement = document.querySelector('h4') as HTMLElement;
  const newName = inputElement.innerText.trim();

  if (!newName) {
    inputElement.innerText = this.selectedWorkout.name;
    return;
  }

  if (newName !== this.selectedWorkout.name) {
    this.planService.updateWorkoutName(this.selectedWorkout.id, newName).subscribe({
      next: (updatedWorkout) => {
        this.workoutNameUpdated.emit(updatedWorkout);
        this.selectedWorkout!.name = updatedWorkout.name;
      }
    });
  }
}

onKeyDown(event: KeyboardEvent, context: 'plan' | 'workout'): boolean {
  const input = event.target as HTMLElement;
  const len = input.innerText.trim().length;
  let hasSelection = false;
  const selection = window.getSelection();
  const key = event.key;

  const isSpecial = this.specialKeys.includes(key);
  const isNavigational = this.navigationalKeys.includes(key);

  if (selection) {
    hasSelection = !!selection.toString();
  }

  if (key === 'Enter') {
    event.preventDefault();
    if (context === 'workout') {
      this.updateWorkoutName();
    }
    input.blur();
    return false;
  }

  if (len >= this.maxLen && !hasSelection && !isSpecial && !isNavigational) {
    event.preventDefault();
    return false;
  }

  return true;
}
}
