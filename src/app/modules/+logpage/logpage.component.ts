import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../shared/service/plan.service';

@Component({
  selector: 'app-logpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logpage.component.html',
  styleUrl: './logpage.component.css'
})
export class LogpageComponent implements OnInit {
  workoutLogForm!: FormGroup;
  workoutId!: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private planService: PlanService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.workoutId = +params.get('workoutId')!;
      this.loadWorkoutDetails(this.workoutId);
    });

    this.workoutLogForm = this.fb.group({
      exercises: this.fb.array([]),
    });
  }

  loadWorkoutDetails(workoutId: number) {
    this.planService.getWorkoutById(workoutId).subscribe((workout) => {
      this.populateFormWithWorkout(workout);
    });
  }

  populateFormWithWorkout(workout: any) {
    if (workout && workout.workoutExercises && Array.isArray(workout.workoutExercises)) {
      const exercisesArray = this.fb.array(
        workout.workoutExercises.map((exercise: any) =>
          this.fb.group({
            id: [exercise.id],
            name: [exercise.exerciseName],
            sets: [0, [Validators.required, Validators.min(1)]],
            reps: [0, [Validators.required, Validators.min(1)]],
            weight: [0, [Validators.required, Validators.min(0)]],
            open: [false],
          })
        )
      );
  
      this.workoutLogForm.setControl('exercises', exercisesArray);
    } else {
      this.workoutLogForm.setControl('exercises', this.fb.array([]));
    }
  }

  get exercises() {
    return this.workoutLogForm.get('exercises') as FormArray;
  }

  toggleDropdown(index: number) {
    const exercise = this.exercises.at(index);
    exercise.patchValue({ open: !exercise.value.open });
  }

  submitWorkoutLog() {
    
  }
}