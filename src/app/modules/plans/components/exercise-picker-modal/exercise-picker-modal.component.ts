import { Component } from '@angular/core';
import { Exercise } from '../../../../shared/interfaces/exercise';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-exercise-picker-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercise-picker-modal.component.html',
  styleUrl: './exercise-picker-modal.component.css'
})
export class ExercisePickerModalComponent {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchControl: FormControl = new FormControl('');

  constructor(public activeModal: NgbActiveModal) {
    // Subscribe to search changes and filter exercises
    this.searchControl.valueChanges.subscribe(searchText => {
      this.filteredExercises = this.exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }

  onSelectExercise(exercise: Exercise): void {
    this.activeModal.close(exercise);
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  // Initialize exercises and filteredExercises from the data passed
  initializeExercises(exercises: Exercise[]): void {
    this.exercises = exercises;
    this.filteredExercises = exercises;
  }
}