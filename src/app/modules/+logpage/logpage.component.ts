import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { ToastService } from '../../shared/service/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-logpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logpage.component.html',
  styleUrl: './logpage.component.css',
})
export class LogpageComponent implements OnInit, OnDestroy {
  workoutLogForm!: FormGroup;
  workoutId!: number;
  workoutLogId!: number;
  userId!: number;
  DeleteIcon: string = ASSET_URLS.DeleteIcon;
  formChangesSubscription!: Subscription;
  firstChangeMade: boolean = false;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private workoutLogService: WorkoutLogService,
    private workoutDataService: WorkoutDataService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit() {
    console.log('Initializing LogpageComponent');

    this.workoutLogForm = this.fb.group({
      exercises: this.fb.array([]),
    });

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Current User:', user);
        if (user.id !== undefined) {
          this.userId = user.id;
          this.initializeWorkoutLog();
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
    if (this.formChangesSubscription) {
      console.log('Unsubscribing from form changes');
      this.formChangesSubscription.unsubscribe();
    }
  }

  initializeWorkoutLog() {
    const workoutId = this.workoutDataService.getWorkoutId();
    console.log('Workout ID:', workoutId);

    if (workoutId) {
      this.workoutId = workoutId;

      this.workoutLogService
        .getWorkoutLogByUserIdAndIsEditing(this.userId, true)
        .subscribe({
          next: (editingLogs) => {
            console.log('Editing Logs:', editingLogs);
            if (editingLogs && editingLogs.length > 0) {
              const editingLog = editingLogs[0];
              this.workoutLogId = editingLog.id;
              console.log('Editing Log ID:', this.workoutLogId);
              this.populateFormWithSavedData(editingLog);
              this.trackFormChanges(); // Solo comenzamos a rastrear después de tener un workoutLogId
            } else {
              console.log('No editing logs found, creating new workout log');
              this.loadWorkoutDetailsAndCreateWorkoutLog(this.workoutId);
            }
          },
          error: (err) => {
            console.error('Error fetching editing log:', err);
            this.loadWorkoutDetailsAndCreateWorkoutLog(this.workoutId);
          },
        });
    } else {
      console.error(MSG.errorfindingworkout);
    }
  }

  trackFormChanges() {
    if (!this.workoutLogId) {
      console.warn(
        'Workout log ID is undefined, tracking form changes is disabled until a workout log is created.',
      );
      return; // Do not start tracking until the log is created
    }
  
    console.log('Starting to track form changes');
  
    let updateTimeout: any;
  
    this.formChangesSubscription = this.workoutLogForm.valueChanges.subscribe(() => {
      console.log('Form changes detected:', this.workoutLogForm.value); // Log to check the current form state
  
      if (this.workoutLogId && this.firstChangeMade) {
        // Debounce update call to avoid multiple rapid updates
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          console.log(
            'Form changed, updating workout log. workoutLogId:',
            this.workoutLogId,
          );
          this.updateWorkoutLog();
        }, 500);
      }
    });
  }
  

  // Helper method to detect significant changes in form
  hasSignificantChanges(currentData: any): boolean {
    // Add logic here to check if the current changes are significant.
    // For example, only update if reps or weight have been modified.
    // Return true if an update is needed, otherwise false.
    return true; // Placeholder to be customized
  }

  loadWorkoutDetailsAndCreateWorkoutLog(workoutId: number) {
    console.log('Loading workout details for workoutId:', workoutId);
    this.planService.getWorkoutById(workoutId).subscribe({
      next: (workout) => {
        console.log('Workout loaded:', workout);
        this.populateFormWithWorkout(workout);
      },
      error: (err) => {
        console.error('Error loading workout details:', err);
      },
    });
  }

  populateFormWithWorkout(workout: any) {
    console.log('Populating form with workout details:', workout);
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
    exercisesArray.clear(); // Clear existing form controls to avoid duplication

    if (
      workout &&
      workout.workoutExercises &&
      Array.isArray(workout.workoutExercises)
    ) {
      workout.workoutExercises.forEach((exercise: any) => {
        exercisesArray.push(
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
        );
      });
    }
  }

  populateFormWithSavedData(savedWorkoutLog: any) {
    console.log('Populating form with saved workout log:', savedWorkoutLog);
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
  
    // Clear the exercises array to avoid duplication
    exercisesArray.clear();
  
    if (
      savedWorkoutLog &&
      savedWorkoutLog.exercises &&
      Array.isArray(savedWorkoutLog.exercises)
    ) {
      // Group exercises by `exerciseId` so that multiple sets are grouped correctly
      const groupedExercises = savedWorkoutLog.exercises.reduce((acc: any, curr: any) => {
        const exerciseId = curr.exerciseId;
        if (!acc[exerciseId]) {
          acc[exerciseId] = { ...curr, sets: [] };
        }
        acc[exerciseId].sets.push(...curr.sets);
        return acc;
      }, {});
  
      // Populate form with grouped exercises
      Object.values(groupedExercises).forEach((exercise: any) => {
        // Fetch the exercise name using the exerciseId
        this.workoutLogService.getExerciseById(exercise.exerciseId).subscribe({
          next: (exerciseData) => {
            console.log('Exercise data retrieved:', exerciseData);
  
            exercisesArray.push(
              this.fb.group({
                id: [exercise.id],
                exerciseId: [exercise.exerciseId],
                name: [exerciseData.name || 'Unknown Name'], // Use fetched name here
                open: [false],
                sets: this.fb.array(
                  exercise.sets.map((set: any) => this.createSetWithValues(set))
                ),
              })
            );
          },
          error: (error) => {
            console.error(`Error fetching exercise with ID ${exercise.exerciseId}:`, error);
            // Push with a fallback name in case of an error
            exercisesArray.push(
              this.fb.group({
                id: [exercise.id],
                exerciseId: [exercise.exerciseId],
                name: ['Unknown Name'],
                open: [false],
                sets: this.fb.array(
                  exercise.sets.map((set: any) => this.createSetWithValues(set))
                ),
              })
            );
          }
        });
      });
    }
  }
  

  createSetWithValues(set: any): FormGroup {
    console.log('Creating set with values:', set);
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
    console.log('Creating empty set');
    return this.fb.group({
      reps: [0, [Validators.required, Validators.min(1), Validators.max(999)]],
      weight: [
        0,
        [Validators.required, Validators.min(0), Validators.max(999)],
      ],
    });
  }

  addSet(exerciseIndex: number) {
    console.log('Adding set to exercise index:', exerciseIndex);
    const sets = this.getSets(this.exercises.at(exerciseIndex));
    sets.push(this.createSet());
  }

  getSets(exercise: any): FormArray {
    return exercise.get('sets') as FormArray;
  }

  get exercises(): FormArray {
    return this.workoutLogForm.get('exercises') as FormArray;
  }

  toggleDropdown(index: number) {
    console.log('Toggling dropdown for exercise index:', index);
    const exercise = this.exercises.at(index);
    exercise.patchValue({ open: !exercise.value.open });
  }

  createWorkoutLog() {
    if (this.workoutLogId) {
      console.log('Workout log already exists, skipping creation.');
      return; // Skip creation if log already exists
    }
  
    const initialWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      notes: 'Initial workout log',
      exercises: this.exercises.controls.map((exerciseControl) => ({
        exerciseId: exerciseControl.get('id')?.value,
        sets: this.getSets(exerciseControl).controls.map((setControl, setIndex) => ({
          set: setIndex + 1,
          reps: setControl.get('reps')?.value,
          weight: setControl.get('weight')?.value,
        })),
      })),
      isEditing: true,
    };
  
    console.log('Creating Workout Log:', initialWorkoutLog);
  
    this.workoutLogService.createWorkoutLog(initialWorkoutLog).subscribe({
      next: (response) => {
        console.log('Workout Log Created:', response);
        this.workoutLogId = response.id; // Set workoutLogId for further updates
        this.firstChangeMade = true; // Allow updates after first creation
        console.log('Workout log created successfully, starting to track form changes.');
        this.trackFormChanges(); // Start tracking only after the workout log is created
      },
      error: (error) => {
        this.toastService.showToast('Error creating workout log.', 'danger');
        console.error('Error creating workout log:', error);
      },
    });
  }
  
  updateWorkoutLog() {
    if (!this.workoutLogId) {
      console.log('Workout log ID is undefined, creating a new workout log.');
      this.createWorkoutLog(); // Si no hay ID de log, crea un nuevo log
      return;
    }
  
    const updatedWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      notes: this.workoutLogForm.get('notes')?.value || 'No notes',
      exercises: this.exercises.controls.map((exerciseControl) => ({
        id: exerciseControl.get('id')?.value,
        exerciseId: exerciseControl.get('id')?.value,
        sets: this.getSets(exerciseControl).controls.map(
          (setControl, setIndex) => ({
            set: setIndex + 1,
            reps: setControl.get('reps')?.value,
            weight: setControl.get('weight')?.value,
          }),
        ),
      })),
      editing: true,
    };
    
    console.log('Updating Workout Log (full data):', JSON.stringify(updatedWorkoutLog, null, 2));
    
  
    // Verifica si hay al menos un set antes de enviar la solicitud
    if (updatedWorkoutLog.exercises.some(exercise => exercise.sets.length > 0)) {
      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, updatedWorkoutLog)
        .subscribe({
          next: () => {
            console.log('Workout log updated successfully.');
          },
          error: (error) => {
            this.toastService.showToast('Error updating workout log.', 'danger');
            console.error('Error updating workout log:', error);
          },
        });
    } else {
      console.warn('No sets to update, skipping workout log update.');
    }
  }
  
  submitWorkoutLog() {
    console.log('Submitting workout log');
    if (this.workoutLogForm.valid) {
      const exercisesArray = this.exercises.controls.map((exerciseControl) => ({
        exerciseId: exerciseControl.get('id')?.value,
        sets: this.getSets(exerciseControl).controls.map(
          (setControl, setIndex) => ({
            set: setIndex + 1,
            reps: setControl.get('reps')?.value,
            weight: setControl.get('weight')?.value,
          }),
        ),
      }));

      const workoutLogData = {
        userId: this.userId,
        workoutId: this.workoutId,
        date: new Date().toISOString(),
        notes: this.workoutLogForm.get('notes')?.value || 'No notes',
        exercises: exercisesArray,
        isEditing: false,
      };

      console.log('Workout Log Data for submission:', workoutLogData);

      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, workoutLogData)
        .subscribe({
          next: () => {
            console.log('Workout log submitted successfully.');
            this.toastService.showToast(
              'Workout log submitted successfully.',
              'success',
            );
            this.router.navigate(['/log-registry']);
          },
          error: (error) => {
            this.toastService.showToast(
              'Error submitting workout log.',
              'danger',
            );
            console.error('Error submitting workout log:', error);
          },
        });
    } else {
      this.toastService.showToast(
        'Workout log form is invalid. Please fill out all required fields.',
        'danger',
      );

      this.exercises.controls.forEach((exercise, index) => {
        if (exercise.invalid) {
          console.error(`Exercise ${index + 1} is invalid:`, exercise.errors);
        }
        const sets = this.getSets(exercise);
        sets.controls.forEach((set, setIndex) => {
          if (set.invalid) {
            console.error(
              `Set ${setIndex + 1} of Exercise ${index + 1} is invalid:`,
              set.errors,
            );
          }
        });
      });
    }
  }

  clearInput(
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
  ) {
    console.log(
      `Clearing input for exercise ${exerciseIndex}, set ${setIndex}, field ${field}`,
    );
    const exercise = this.exercises.at(exerciseIndex);
    const set = this.getSets(exercise).at(setIndex);

    if (set.get(field)?.value === 0) {
      set.get(field)?.setValue('');
    }
  }

  limitInputLength(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;
    console.log('Limiting input length for:', input.id);

    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }

  resetToZero(
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
  ) {
    console.log(
      `Resetting input to zero for exercise ${exerciseIndex}, set ${setIndex}, field ${field}`,
    );
    const exercise = this.exercises.at(exerciseIndex);
    const set = this.getSets(exercise).at(setIndex);

    if (!set.get(field)?.value) {
      set.get(field)?.setValue(0);
    }
  }

  deleteSet(exerciseIndex: number, setIndex: number) {
    console.log(`Deleting set ${setIndex} from exercise ${exerciseIndex}`);
    const sets = this.getSets(this.exercises.at(exerciseIndex));
    sets.removeAt(setIndex);
  }
}
