import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlanService } from '../../shared/service/plan.service';
import { WorkoutLogService } from '../../shared/service/workoutlog.service';
import { WorkoutDataService } from '../../shared/service/workoutdata.service';
import { ASSET_URLS, MSG } from '../../shared/components/constants';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'app-logpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logpage.component.html',
  styleUrl: './logpage.component.css',
})
export class LogpageComponent implements OnInit {
  workoutLogForm!: FormGroup;
  workoutId!: number;
  workoutLogId!: number;
  userId!: number;
  DeleteIcon: string = ASSET_URLS.DeleteIcon;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private workoutLogService: WorkoutLogService,
    private workoutDataService: WorkoutDataService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.workoutLogForm = this.fb.group({
      exercises: this.fb.array([]),
    });

    const savedWorkoutLog = localStorage.getItem('workoutLogForm');
    if (savedWorkoutLog) {
      this.populateFormWithSavedData(JSON.parse(savedWorkoutLog));
    } else {
      const workoutId = this.workoutDataService.getWorkoutId();
      if (workoutId) {
        this.workoutId = workoutId;
        this.loadWorkoutDetails(this.workoutId);
      } else {
        console.error(MSG.errorfindingworkout);
      }
    }

    this.workoutLogForm.valueChanges.subscribe((formValue) => {
      localStorage.setItem('workoutLogForm', JSON.stringify(formValue));
    });

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.id !== undefined) {
          this.userId = user.id;
        } else {
          console.error('User ID is undefined.');
        }
      },
      error: (err) => {
        console.error('Failed to get user ID:', err);
      },
    });
  }

  ngOnDestroy() {
    this.workoutDataService.clearWorkoutId();
    localStorage.removeItem('workoutLogForm');
  }

  loadWorkoutDetails(workoutId: number) {
    this.planService.getWorkoutById(workoutId).subscribe((workout) => {
      this.populateFormWithWorkout(workout);
    });
  }

  populateFormWithWorkout(workout: any) {
    if (
      workout &&
      workout.workoutExercises &&
      Array.isArray(workout.workoutExercises)
    ) {
      const exercisesArray = this.fb.array(
        workout.workoutExercises.map((exercise: any) =>
          this.fb.group({
            id: [exercise.id],
            name: [exercise.exerciseName],
            sets: this.fb.array(
              exercise.sets
                ? exercise.sets.map((set: any) => this.createSetWithValues(set))
                : [this.createSet()],
            ),
            open: [false],
          }),
        ),
      );

      this.workoutLogForm.setControl('exercises', exercisesArray);
    } else {
      this.workoutLogForm.setControl('exercises', this.fb.array([]));
    }
  }

  populateFormWithSavedData(savedWorkoutLog: any) {
    if (
      savedWorkoutLog &&
      savedWorkoutLog.exercises &&
      Array.isArray(savedWorkoutLog.exercises)
    ) {
      const exercisesArray = this.fb.array(
        savedWorkoutLog.exercises.map((exercise: any) => {
          return this.fb.group({
            id: [exercise.id],
            name: [exercise.name],
            open: [false],
            sets: this.fb.array(
              exercise.sets.map((set: any) => this.createSetWithValues(set)),
            ),
          });
        }),
      );

      this.workoutLogForm.setControl('exercises', exercisesArray);

      
    }
  }

  createSetWithValues(set: any): FormGroup {
    return this.fb.group({
      reps: [
        set.reps,
        [Validators.required, Validators.min(1), Validators.max(999)],
      ],
      weight: [
        set.weight,
        [Validators.required, Validators.min(0), Validators.max(999)],
      ],
    });
  }

  createSet(): FormGroup {
    return this.fb.group({
      reps: [0, [Validators.required, Validators.min(1), Validators.max(999)]],
      weight: [
        0,
        [Validators.required, Validators.min(0), Validators.max(999)],
      ],
    });
  }

  addSet(exerciseIndex: number) {
    const sets = this.getSets(this.exercises.at(exerciseIndex));
    sets.push(this.createSet());
    this.updateWorkoutLog();
  }

  getSets(exercise: any): FormArray {
    return exercise.get('sets') as FormArray;
  }

  get exercises(): FormArray {
    return this.workoutLogForm.get('exercises') as FormArray;
  }

  toggleDropdown(index: number) {
    const exercise = this.exercises.at(index);
    exercise.patchValue({ open: !exercise.value.open });
  }

  createWorkoutLog() {
    const initialWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      notes: 'Initial workout log',
      exercises: [],
    };

    this.workoutLogService.createWorkoutLog(initialWorkoutLog).subscribe(
      (response) => {
        this.workoutLogId = response.id;
      },
      (error) => {
        console.error('Error creating workout log:', error);
      },
    );
  }

  updateWorkoutLog() {
    if (this.workoutLogId) {
      const updatedWorkoutLog = {
        ...this.workoutLogForm.value,
        workoutLogId: this.workoutLogId,
      };

      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, updatedWorkoutLog)
        .subscribe(
          (response) => {
            console.log('Workout log updated successfully:', response);
          },
          (error) => {
            console.error('Error updating workout log:', error);
          },
        );
    }
  }

  submitWorkoutLog() {
    if (this.workoutLogForm.valid) {
      this.updateWorkoutLog();
      localStorage.removeItem('workoutLogForm');
    }
  }

  clearInput(
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
  ) {
    const exercise = this.exercises.at(exerciseIndex);
    const set = this.getSets(exercise).at(setIndex);

    if (set.get(field)?.value === 0) {
      set.get(field)?.setValue('');
    }
  }
  limitInputLength(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;

    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }
  resetToZero(
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
  ) {
    const exercise = this.exercises.at(exerciseIndex);
    const set = this.getSets(exercise).at(setIndex);

    if (!set.get(field)?.value) {
      set.get(field)?.setValue(0);
    }
  }

  deleteSet(exerciseIndex: number, setIndex: number) {
    // Get the sets FormArray for the specified exercise
    const sets = this.getSets(this.exercises.at(exerciseIndex));
  
    // Remove the specified set
    sets.removeAt(setIndex);
  
    // Update localStorage
    this.updateLocalStorage();
  }
  
  updateLocalStorage() {
    // Update the localStorage with the current form value
    localStorage.setItem('workoutLogForm', JSON.stringify(this.workoutLogForm.value));
  }
}
