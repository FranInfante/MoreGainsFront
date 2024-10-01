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
import { Router } from '@angular/router';
import { ToastService } from '../../shared/service/toast.service';

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
          console.error('User ID is undefined.');
        }
      },
      error: (err) => {
        console.error('Failed to get user ID:', err);
      },
    });
  }

  initializeWorkoutLog() {
    const workoutId = this.workoutDataService.getWorkoutId();
    if (workoutId) {
      this.workoutId = workoutId;

      this.workoutLogService
        .getWorkoutLogByUserIdAndIsEditing(this.userId, true)
        .subscribe({
          next: (editingLogs) => {
            if (
              editingLogs &&
              editingLogs.length > 0 &&
              editingLogs[0].isEditing === true
            ) {
              const editingLog = editingLogs[0];
              this.workoutLogId = editingLog.id;
              this.populateFormWithSavedData(editingLog);
            } else {
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

  loadWorkoutDetailsAndCreateWorkoutLog(workoutId: number) {
    this.planService.getWorkoutById(workoutId).subscribe({
      next: (workout) => {
        this.populateFormWithWorkout(workout);
      },
      error: (err) => {
        console.error('Error loading workout details:', err);
      },
    });
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
      console.error('Workout exercises are empty or invalid.');
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

    this.workoutLogService.createWorkoutLog(initialWorkoutLog).subscribe({
      next: (response) => {
        this.workoutLogId = response.id;
      },
      error: (error) => {
        console.error('Error creating workout log:', error);
      },
    });
  }

  updateWorkoutLog() {
    if (this.workoutLogId) {
      const updatedWorkoutLog = {
        ...this.workoutLogForm.value,
        workoutLogId: this.workoutLogId,
      };

      this.workoutLogService
        .updateWorkoutLog(this.workoutLogId, updatedWorkoutLog)
        .subscribe({
          next: (response) => {},
          error: (error) => {
            console.error('Error updating workout log:', error);
          },
        });
    }
  }

  submitWorkoutLog() {
    if (this.workoutLogForm.valid) {
      const exercisesArray = this.exercises.controls.map(
        (exerciseControl, exerciseIndex) => {
          return {
            exerciseId: exerciseControl.get('id')?.value,
            sets: this.getSets(exerciseControl).controls.map(
              (setControl, setIndex) => {
                return {
                  set: setIndex + 1,
                  reps: setControl.get('reps')?.value,
                  weight: setControl.get('weight')?.value,
                };
              }
            ),
          };
        }
      );
  
      const workoutLogData = {
        userId: this.userId,
        workoutId: this.workoutId,
        date: new Date().toISOString(),
        notes: this.workoutLogForm.get('notes')?.value || 'No notes',
        exercises: exercisesArray,
      };
  
      if (!this.workoutLogId) {
        this.workoutLogService.createWorkoutLog(workoutLogData).subscribe({
          next: (response) => {
            this.toastService.showToast(
              'Workout log submitted successfully.',
              'success'
            );
            this.router.navigate(['/log-registry']);
          },
          error: (error) => {
            this.toastService.showToast(
              'Error creating workout log. Please try again.',
              'danger'
            );
            console.error('Error creating workout log:', error);
          },
        });
      } else {
        this.workoutLogService
          .updateWorkoutLog(this.workoutLogId, workoutLogData)
          .subscribe({
            next: () => {
              this.toastService.showToast(
                'Workout log updated successfully.',
                'success'
              );
              this.router.navigate(['/log-registry']);
            },
            error: (error) => {
              this.toastService.showToast(
                'Error updating workout log. Please try again.',
                'danger'
              );
              console.error('Error updating workout log:', error);
            },
          });
      }
    } else {
      this.toastService.showToast(
        'Workout log form is invalid. Please fill out all required fields.',
        'danger'
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
              set.errors
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
  }
}
