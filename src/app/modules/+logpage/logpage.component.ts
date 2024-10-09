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
  imports: [CommonModule, ReactiveFormsModule, BackToMenuComponent],
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
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

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
                this.populateFormWithSavedData(editingLog);
                this.trackFormChanges();
              } else {
                this.loadWorkoutDetailsAndCreateWorkoutLog(this.workoutId);
              }
            } else {
              this.loadWorkoutDetailsAndCreateWorkoutLog(this.workoutId);
            }
          },
          error: (err) => {
            console.error(MSG.errorfindingworkout, err);
            this.loadWorkoutDetailsAndCreateWorkoutLog(this.workoutId);
          },
        });
    } else {
      this.router.navigate([LOCATIONS.plans]);
    }
  }

  trackFormChanges() {
    if (!this.workoutLogId) {
      return;
    }

    let updateTimeout: any;

    this.formChangesSubscription = this.workoutLogForm.valueChanges.subscribe(() => {
      if (this.workoutLogId && this.firstChangeMade) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          this.updateWorkoutLog();
        }, 500);
      }
    });
  }

  loadWorkoutDetailsAndCreateWorkoutLog(workoutId: number) {
    this.planService.getWorkoutById(workoutId).subscribe({
      next: (workout) => {
        this.populateFormWithWorkout(workout);
      },
      error: (err) => {
        console.error(MSG.errorfindingworkout, err);
      },
    });
  }

  populateFormWithWorkout(workout: any) {
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
    exercisesArray.clear();

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
            open: [false],
          }),
        );
      });
    }
  }

  populateFormWithSavedData(savedWorkoutLog: WorkoutLog) {
    const exercisesArray = this.workoutLogForm.get('exercises') as FormArray;
    exercisesArray.clear();
  
    if (savedWorkoutLog && savedWorkoutLog.exercises && Array.isArray(savedWorkoutLog.exercises)) {
      // Do not group by exerciseId. Instead, treat each exercise as a unique instance.
      savedWorkoutLog.exercises.forEach((exercise: any, index: number) => {
        this.workoutLogService.getExerciseById(exercise.exerciseId).subscribe({
          next: (exerciseData) => {
            exercisesArray.push(
              this.fb.group({
                id: [exercise.id],
                exerciseId: [exercise.exerciseId],
                workoutLogId: [exercise.workoutLogId],
                name: [exerciseData.name || 'Unknown Name'],
                open: [false],
                sets: this.fb.array(
                  exercise.sets.map((set: any) => this.createSetWithValues(set))
                ),
              }),
            );
          },
        });
      });
    }
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
    if (this.workoutLogId) {
      return;
    }

    const initialWorkoutLog = {
      userId: this.userId,
      workoutId: this.workoutId,
      date: new Date().toISOString(),
      notes: 'Initial workout log',
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
        this.workoutLogId = response.id;
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
      notes: this.workoutLogForm.get('notes')?.value || 'No notes',
      exercises: this.exercises.controls.map((exerciseControl, index) => ({
        id: exerciseControl.get('id')?.value,
        exerciseId: exerciseControl.get('exerciseId')?.value,
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
  
    if (updatedWorkoutLog.exercises.some(exercise => exercise.sets.length > 0)) {
      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, updatedWorkoutLog)
        .subscribe({
          next: () => {},
          error: (error) => {
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
        notes: this.workoutLogForm.get('notes')?.value || 'No notes',
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

    if (!set.get(field)?.value) {
      set.get(field)?.setValue(0);
    }
  }

  deleteSet(exerciseIndex: number, setIndex: number) {
    const exerciseControl = this.exercises.at(exerciseIndex);
    const exerciseId = exerciseControl.get('exerciseId')?.value;

    if (!this.workoutLogId || !exerciseControl) {
      console.warn(MSG.noworkoutlogidfound);
      return;
    }

    const workoutLogId = this.workoutLogId;
    const setNumber = setIndex + 1;

    if (exerciseId !== undefined && workoutLogId !== undefined) {
      this.workoutLogService.deleteWorkoutLogSet(workoutLogId, exerciseId, setNumber).subscribe({
        next: () => {
          const sets = this.getSets(this.exercises.at(exerciseIndex));
          sets.removeAt(setIndex);
        },
        error: (error) => {
          this.toastService.showToast(TOAST_MSGS.errorcreatingworkout, 'danger');
        },
      });
    }
  }
}