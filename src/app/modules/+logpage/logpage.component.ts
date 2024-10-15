import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlanService } from '../../shared/service/plan.service';
import { WorkoutLogService } from '../../shared/service/workoutlog.service';
import { WorkoutDataService } from '../../shared/service/workoutdata.service';
import { ASSET_URLS, LOCATIONS, MSG, TOAST_MSGS } from '../../shared/components/constants';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/service/toast.service';
import { Subscription } from 'rxjs';
import { WorkoutLog } from '../../shared/interfaces/workoutlog';
import { BackToMenuComponent } from "../../shared/components/back-to-menu/back-to-menu.component";

@Component({
  selector: 'app-logpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackToMenuComponent, FormsModule],
  templateUrl: './logpage.component.html',
  styleUrl: './logpage.component.css',
})
export class LogpageComponent implements OnInit, OnDestroy {
  workoutLogForm!: FormGroup;
  workoutId!: number;
  workoutLogId!: number;
  userId!: number;
  DeleteIcon: string = ASSET_URLS.DeleteIcon;
  NotesIcon: string = ASSET_URLS.NotesIcon;
  formChangesSubscription!: Subscription;
  firstChangeMade: boolean = false;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;
  isInputFocused: boolean = false;
  selectedExercise: string = '';
  currentNotes: string = '';

  selectedExerciseIndex: number | null = null;
  updateTimeout: any;


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
    this.workoutLogForm = this.fb.group({
      exercises: this.fb.array([]),
    });

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.id !== undefined) {
          this.userId = user.id;
          this.initializeWorkoutLog();
        } else {
          console.error(MSG.fetcherror);
        }
      },
      error: (err) => {
        console.error(MSG.fetcherror, err);
      },
    });
  }

  ngOnDestroy() {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  initializeWorkoutLog() {
    const workoutId = this.workoutDataService.getWorkoutId();
  
    if (workoutId) {
      this.workoutId = workoutId;
  
      this.workoutLogService
        .getWorkoutLogByUserIdAndIsEditing(this.userId, true)
        .subscribe({
          next: (editingLogs) => {
            if (editingLogs && editingLogs.length > 0) {
              const editingLog = editingLogs.find((log: WorkoutLog) => log.editing === true);
              if (editingLog) {
                this.workoutLogId = editingLog.id;
                this.populateFormWithSavedData(editingLog);  // Populate the form with existing log data
                this.trackFormChanges();
                console.log('Loaded saved workout log:', editingLog);
              } else {
                this.createAndLoadWorkoutLog();  // No existing log, create a new one and load it
              }
            } else {
              this.createAndLoadWorkoutLog();  // No logs found, create a new one and load it
            }
          },
          error: (err) => {
            console.error(MSG.errorfindingworkout, err);
            this.createAndLoadWorkoutLog();  // Handle errors by creating a new log
          },
        });
    } else {
      this.router.navigate([LOCATIONS.plans]);  // Redirect if no workout ID is found
    }
  }
  

  trackFormChanges() {
    if (!this.workoutLogId) {
      return;
    }
  
    let updateTimeout: any;
  
    this.formChangesSubscription = this.workoutLogForm.valueChanges.subscribe(() => {
      if (this.workoutLogId && this.firstChangeMade) {
        // Validate the form before triggering an update
        if (this.workoutLogForm.valid && this.hasValidSets()) {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            this.updateWorkoutLog();
          }, 500);
        } else {
          console.log('Invalid form values, skipping update');
        }
      }
    });
  }

  hasValidSets(): boolean {
    return this.exercises.controls.every(exercise => 
      this.getSets(exercise).controls.every(set => 
        set.get('reps')?.value > 0 && set.get('weight')?.value >= 0
      )
    );
  }
  

  loadWorkoutDetailsAndCreateWorkoutLog(workoutId: number) {
    this.planService.getWorkoutById(workoutId).subscribe({
      next: (workout) => {
        this.populateFormWithWorkout(workout);  // Populate the form with workout details
        this.createWorkoutLog();  // Automatically create the workout log after loading the workout details
      },
      error: (err) => {
        console.error(MSG.errorfindingworkout, err);
      },
    });
  }
  

  populateFormWithWorkout(workout: any) {
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
    exercisesArray.clear();
  
    console.log('Workout retrieved:', workout);
  
    if (workout && workout.workoutExercises && Array.isArray(workout.workoutExercises)) {
      workout.workoutExercises.forEach((exercise: any) => {
        exercisesArray.push(
          this.fb.group({
            id: [exercise.id],
            exerciseId: [exercise.exerciseId],
            name: [exercise.exerciseName],
            sets: this.fb.array(
              exercise.sets
                ? exercise.sets.map((set: any) => this.createSetWithValues(set))
                : [this.createSet()],
            ),
            notes: [exercise.notes || ''],
            open: [false],
          }),
        );
      });
    }
  
    console.log('Form after workout is populated:', this.workoutLogForm.value);
  }
  

  populateFormWithSavedData(savedWorkoutLog: WorkoutLog) {
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
    exercisesArray.clear();

    console.log('Saved workout log:', savedWorkoutLog);
  
    if (savedWorkoutLog && savedWorkoutLog.exercises && Array.isArray(savedWorkoutLog.exercises)) {
      // Group exercises by exerciseId
      const groupedExercises = new Map<number, any>();
  
      savedWorkoutLog.exercises.forEach((exercise: any) => {
        if (!groupedExercises.has(exercise.exerciseId)) {
          groupedExercises.set(exercise.exerciseId, {
            ...exercise,
            sets: [...exercise.sets],
          });
        } else {
          const existingExercise = groupedExercises.get(exercise.exerciseId);
          existingExercise.sets = existingExercise.sets.concat(exercise.sets); // Combine sets
        }
      });
  
      // Now we have exercises grouped with combined sets, so we can process them
      groupedExercises.forEach((exercise: any) => {
        this.workoutLogService.getExerciseById(exercise.exerciseId).subscribe({
          next: (exerciseData) => {
            const formGroup = this.fb.group({
              id: [exercise.id],
              exerciseId: [exercise.exerciseId],
              workoutLogId: [exercise.workoutLogId],
              name: [exerciseData.name || 'Unknown Name'],
              notes: [exercise.notes || ''],
              open: [false],
              sets: this.fb.array([]), 
            });
  
            // Add form group to the exercises array.
            exercisesArray.push(formGroup);
  
            // Add the sets after the formGroup is created.
            const setsArray = formGroup.get('sets') as FormArray; // Cast to FormArray
            exercise.sets.forEach((set: any) => {
              setsArray.push(this.createSetWithValues(set)); // Now push works
            });
          },
        });
      });
    }
    console.log('Form after adding saved exercise data:', this.workoutLogForm.value);
  }
  
  

  createSetWithValues(set: any): FormGroup {
    return this.fb.group({
      reps: [set.reps, [Validators.required, Validators.min(0), Validators.max(999)]],
      weight: [set.weight, [Validators.required, Validators.min(0), Validators.max(999)]],
    });
  }

  createSet(): FormGroup {
    return this.fb.group({
      reps: [0, [Validators.required, Validators.min(1), Validators.max(999)]],
      weight: [0, [Validators.required, Validators.min(0), Validators.max(999)]],
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

  createAndLoadWorkoutLog() {
    this.planService.getWorkoutById(this.workoutId).subscribe({
      next: (workout) => {
        this.populateFormWithWorkout(workout);  // Populate the form with workout details
        this.createWorkoutLog();  // Create the workout log
      },
      error: (err) => {
        console.error(MSG.errorfindingworkout, err);
      },
    });
  }

  loadSavedWorkoutLog() {
    this.workoutLogService.getWorkoutLogById(this.workoutLogId).subscribe({
      next: (savedWorkoutLog) => {
        this.populateFormWithSavedData(savedWorkoutLog);  // Now populate form with saved workout log
        console.log('Form after loading saved workout log:', this.workoutLogForm.value);
      },
      error: (err) => {
        console.error(MSG.errorfindingworkout, err);
      },
    });
  }
  
  
  createWorkoutLog() {
    if (this.workoutLogId) {
      return;  // Skip if a workout log already exists
    }
  
    const initialWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      exercises: this.exercises.controls.map((exerciseControl) => ({
        exerciseId: exerciseControl.get('exerciseId')?.value,
        sets: this.getSets(exerciseControl).controls.map((setControl, setIndex) => ({
          set: setIndex + 1,
          reps: setControl.get('reps')?.value,
          weight: setControl.get('weight')?.value,
        })),
      })),
      editing: true,
    };
  
    this.workoutLogService.createWorkoutLog(initialWorkoutLog).subscribe({
      next: (response) => {
        this.workoutLogId = response.id;  // Store the ID of the newly created log
        this.loadSavedWorkoutLog();  // Load the created log into the form
        this.firstChangeMade = true;
        this.trackFormChanges();
      },
      error: (error) => {
        this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
      },
    });
  }
  
  

  updateWorkoutLog() {
    if (!this.workoutLogId) {
      this.createWorkoutLog();
      return;
    }
  
    const updatedWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      exercises: this.exercises.controls.map((exerciseControl, index) => ({
        id: exerciseControl.get('id')?.value,
        exerciseId: exerciseControl.get('exerciseId')?.value,
        notes: exerciseControl.get('notes')?.value,
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
  
  
    // Proceed with the update request
    if (updatedWorkoutLog.exercises.some(exercise => exercise.sets.length > 0)) {
      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, updatedWorkoutLog)
        .subscribe({
          next: () => {
          },
          error: (error) => {
            console.error('Error updating workout log', error);
            this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
          },
        });
    }
  }
  

  submitWorkoutLog() {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  
    if (this.workoutLogForm.valid) {
      const exercisesArray = this.exercises.controls.map((exerciseControl) => ({
        id: exerciseControl.get('id')?.value,
        exerciseId: exerciseControl.get('exerciseId')?.value,
        workoutLogId: this.workoutLogId,
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
        exercises: exercisesArray,
        editing: false, // Set editing to false since the log is being submitted
      };
  
      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, workoutLogData)
        .subscribe({
          next: () => {
            this.toastService.showToast(TOAST_MSGS.workoutdeletedsaved, 'success');
            this.router.navigate(['/log-registry']);
          },
          error: (error) => {
            this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
          },
        });
    } else {
      this.toastService.showToast(TOAST_MSGS.fillallfields, 'danger');
    }
  }

  clearInput(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight') {
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

  resetToZero(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight') {
  const exercise = this.exercises.at(exerciseIndex);
  const set = this.getSets(exercise).at(setIndex);
  
  // Check for null, undefined, or empty values and reset to 0
  const fieldValue = set.get(field)?.value;
  if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
    set.get(field)?.setValue(0);
  }
}

  deleteSet(exerciseIndex: number, setIndex: number) {
    const exerciseControl = this.exercises.at(exerciseIndex);
    const sets = this.getSets(exerciseControl);
    
    if (sets.length === 1) {
      this.toastService.showToast("You cannot delete all sets. There must be at least one set.", 'danger');
      return;
    }
  
    const exerciseId = exerciseControl.get('exerciseId')?.value;
    const workoutLogId = this.workoutLogId;
    const setNumber = setIndex + 1;
  
    if (exerciseId !== undefined && workoutLogId !== undefined) {
      this.workoutLogService.deleteWorkoutLogSet(workoutLogId, exerciseId, setNumber).subscribe({
        next: () => {
          sets.removeAt(setIndex);
        },
        error: (error) => {
          this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
        },
      });
    }
  }
  
  onInputFocus() {
    this.isInputFocused = true;
}

onInputBlur() {
    this.isInputFocused = false;
}

hasSets(): boolean {
  return this.exercises.controls.some(exercise => this.getSets(exercise).length > 0);
}

setSelectedExercise(exerciseIndex: number) {
  const exerciseControl = this.exercises.at(exerciseIndex);
  if (exerciseControl) {
  } else {
    console.error('No exercise control found at index', exerciseIndex);
  }

  this.selectedExerciseIndex = exerciseIndex;
  this.selectedExercise = exerciseControl.get('name')?.value || 'Unknown';
}

saveExerciseNotes() {
  if (this.selectedExerciseIndex !== null) {
    const exerciseControl = this.exercises.at(this.selectedExerciseIndex) as FormGroup;
    const workoutLogExerciseId = exerciseControl.get('id')?.value;
    const exerciseId = exerciseControl.get('exerciseId')?.value;
    const workoutLogId = this.workoutLogId;

    console.log('Exercise Control:', exerciseControl);
    console.log('WorkoutLogExercise ID:', workoutLogExerciseId);
    console.log('Exercise ID:', exerciseId);
    console.log('WorkoutLog ID:', workoutLogId);

    if (workoutLogExerciseId) {
      const sets = this.getSets(exerciseControl).controls.map((setControl, setIndex) => ({
        set: setIndex + 1,
        reps: setControl.get('reps')?.value,
        weight: setControl.get('weight')?.value,
      }));

      const updatedExercise = {
        exerciseId: exerciseId,
        workoutLogId: workoutLogId,
        sets: sets,
        notes: exerciseControl.get('notes')?.value || '', 
      };

      this.workoutLogService.updateWorkoutLogExercise(workoutLogExerciseId, updatedExercise)
        .subscribe({
          next: () => {
            this.toastService.showToast('Notes saved successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating notes', error);
            this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
          }
        });
    }
  }
}

getExerciseFormGroup(exerciseIndex: number): FormGroup {
  return this.exercises.at(exerciseIndex) as FormGroup;
}

triggerWorkoutLogUpdate(exerciseIndex: number, setIndex: number) {
  const exerciseControl = this.exercises.at(exerciseIndex);
  const setControl = this.getSets(exerciseControl).at(setIndex);

  const repsValue = setControl.get('reps')?.value;
  const weightValue = setControl.get('weight')?.value;

  // Only update if the values are non-null, defined, and 0 or greater
  if (repsValue !== null && repsValue !== undefined && repsValue >= 0 && 
      weightValue !== null && weightValue !== undefined && weightValue >= 0) {
      
    clearTimeout(this.updateTimeout);

    this.updateTimeout = setTimeout(() => {
      console.log('Update timeout triggered');
      this.updateWorkoutLog();
    }, 500); // Delay to avoid frequent updates while typing
  }
}

}
