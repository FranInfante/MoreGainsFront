import { Component, OnInit } from '@angular/core';
import { Exercise } from '../../../../shared/interfaces/exercise';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../../../../shared/service/exercise.service';
import { ToastService } from '../../../../shared/service/toast.service';
import { UserService } from '../../../../shared/service/user.service';
import { MuscleGroup } from '../../../../shared/interfaces/musclegroup';

@Component({
  selector: 'app-exercise-picker-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './exercise-picker-modal.component.html',
  styleUrl: './exercise-picker-modal.component.css'
})
export class ExercisePickerModalComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchControl: FormControl = new FormControl('');
  selectedExercise: Exercise | null = null;
  exerciseDetails = { reps: 0, sets: 0, weight: 0 };
  creatingNewExercise: boolean = false;
  muscleGroups: MuscleGroup[] = [];
  userId: number | null = null;
  noExercisesFound: boolean = false;

  newExerciseForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    muscleGroup: new FormControl('', Validators.required)
  });

  constructor(
    private exerciseService: ExerciseService,
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadExercises();
    this.loadMuscleGroups();
    this.getCurrentUserId();
    this.searchControl.valueChanges.subscribe(searchText => {
      this.filterExercises(searchText);
    });
  }

  getCurrentUserId(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.userId = user.id;
        this.loadExercises();
      }
    });
  }

  loadExercises(): void {
    if (this.userId !== null) {
      this.exerciseService.getallExercises(this.userId).subscribe(exercises => {
        this.exercises = exercises;
        this.filteredExercises = exercises;
      });
    }
  }

  filterExercises(searchText: string): void {
    this.filteredExercises = this.exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchText.toLowerCase())
    );
    this.noExercisesFound = this.filteredExercises.length === 0;
  }

  selectExercise(exercise: Exercise): void {
    this.selectedExercise = exercise;
    const workoutExercise = { exerciseName: exercise.name };
    this.activeModal.close(workoutExercise);
  }

  deselectExercise(): void {
    this.selectedExercise = null;
  }

  onSubmit(): void {
    if (this.selectedExercise) {
      const workoutExercise = { 
        exerciseName: this.selectedExercise.name
      };
      this.activeModal.close(workoutExercise);
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onCreateNewExercise(): void {
    const newExerciseName = this.newExerciseForm.get('name')?.value.trim();
    const description = this.newExerciseForm.get('description')?.value;
    const muscleGroupId = this.newExerciseForm.get('muscleGroup')?.value;

    if (newExerciseName && muscleGroupId) {
      if (this.userId) {
        const newExercise = { 
          name: newExerciseName, 
          description, 
          muscleGroup: { id: muscleGroupId },
          userId: this.userId // Use the retrieved user ID here
        };

        this.exerciseService.createOrCheckExercise(newExercise).subscribe(response => {
          this.activeModal.dismiss();
        });
      }
    }
  }

  cancelCreateExercise(): void {
    this.creatingNewExercise = false;
    this.newExerciseForm.reset();
  }

  toggleCreateExercise(): void {
    this.creatingNewExercise = !this.creatingNewExercise;
  }

  loadMuscleGroups(): void {
    this.exerciseService.getMuscleGroups().subscribe(groups => {
      this.muscleGroups = groups; // Asigna los grupos musculares a la propiedad
    });
  }
}