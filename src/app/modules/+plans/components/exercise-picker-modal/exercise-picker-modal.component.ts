import { Component, OnInit } from '@angular/core';
import { Exercise } from '../../../../shared/interfaces/exercise';
import { FormControl, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../../../../shared/service/exercise.service';

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

  constructor(
    private exerciseService: ExerciseService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.loadExercises();
    this.searchControl.valueChanges.subscribe(searchText => {
      this.filterExercises(searchText);
    });
  }

  loadExercises(): void {
    this.exerciseService.getallExercises().subscribe(exercises => {
      this.exercises = exercises;
      this.filteredExercises = exercises;
    });
  }

  filterExercises(searchText: string): void {
    this.filteredExercises = this.exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  selectExercise(exercise: Exercise): void {
    this.selectedExercise = exercise;
  }

  deselectExercise(): void {
    this.selectedExercise = null;
    this.exerciseDetails = { reps: 0, sets: 0, weight: 0 }; // Reset details
  }

  onSubmit(): void {
    if (this.selectedExercise) {
      const workoutExercise = { 
        exerciseName: this.selectedExercise.name, 
        reps: this.exerciseDetails.reps, 
        sets: this.exerciseDetails.sets, 
        weight: this.exerciseDetails.weight
      };
      this.activeModal.close(workoutExercise);
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}