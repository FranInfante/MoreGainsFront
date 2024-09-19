import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MuscleGroup } from '../../../../shared/interfaces/musclegroup';
import { ExerciseService } from '../../../../shared/service/exercise.service';
import { ToastService } from '../../../../shared/service/toast.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../shared/service/user.service';
import { Exercise } from '../../../../shared/interfaces/exercise';

@Component({
  selector: 'app-create-exercise-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-exercise-modal.component.html',
  styleUrl: './create-exercise-modal.component.css'
})
export class CreateExerciseModalComponent implements OnInit {
  newExerciseForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    muscleGroup: new FormControl('', Validators.required)
  });
  muscleGroups: MuscleGroup[] = [];
  userId: number | null = null;

  planId: number | null = null;
  workoutId: number | null = null; 

  constructor(
    private exerciseService: ExerciseService,
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadMuscleGroups();
    this.getCurrentUserId();
  }

  getCurrentUserId(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.userId = user.id;
      }
    });
  }

  loadMuscleGroups(): void {
    this.exerciseService.getMuscleGroups().subscribe(groups => {
      this.muscleGroups = groups;
    });
  }

  onCreateNewExercise(): void {
    const newExerciseName = this.newExerciseForm.get('name')?.value.trim();
    const description = this.newExerciseForm.get('description')?.value;
    const muscleGroupId = this.newExerciseForm.get('muscleGroup')?.value;
  
    if (!this.userId || !this.planId || !this.workoutId) {
      return;
    }
  
    if (newExerciseName && muscleGroupId) {
      const newExercise = {
        name: newExerciseName,
        description: description || null,
        muscleGroup: { id: muscleGroupId },
        userId: this.userId,
        planId: this.planId,
        workoutId: this.workoutId,
      };
  
      this.exerciseService.createOrCheckExercise(newExercise).subscribe({
        next: (response) => {
      
          const exercise = (response as any).exercise || response;
      
          if (exercise) {
            const workoutExercise = { exerciseName: exercise.name };
            this.activeModal.close(workoutExercise); 
          } else {
            console.error('No valid exercise found in response');
          }
        },
        error: (err) => {
          console.error('Error creating exercise:', err);
        }
      });
    }
  }

  cancelCreateExercise(): void {
    this.activeModal.dismiss();
  }
}
