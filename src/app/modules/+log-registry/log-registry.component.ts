import { Component, OnInit } from '@angular/core';
import { WorkoutLogService } from '../../shared/service/workoutlog.service';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorkoutLogDetailModalComponent } from './components/work-log-detail/work-log-detail.component';
import { LOCATIONS, MSG } from '../../shared/components/constants';
import { BackToMenuComponent } from "../../shared/components/back-to-menu/back-to-menu.component";

@Component({
  selector: 'app-log-registry',
  standalone: true,
  imports: [CommonModule, WorkoutLogDetailModalComponent, BackToMenuComponent],
  templateUrl: './log-registry.component.html',
  styleUrl: './log-registry.component.css'
})
export class LogRegistryComponent implements OnInit {
  userId!: number;
  workoutLogs: any[] = [];
  isLoading: boolean = true;
  selectedWorkoutLog: any = null;
  showModal: boolean = false;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

  constructor(
    private workoutLogService: WorkoutLogService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.id !== undefined) {
          this.userId = user.id;
          this.getWorkoutLogsForUser();
        } else {
          console.error(MSG.useridundefined);
        }
      },
      error: (err) => {
        console.error(MSG.failedtogetuserid, err);
      },
    });
  }

  getWorkoutLogsForUser() {
    this.workoutLogService.getWorkoutLogByUserId(this.userId).subscribe({
      next: (logs) => {
        this.workoutLogs = logs.map((log) => {
          return {
            ...log,
            date: new Date(log.date[0], log.date[1] - 1, log.date[2], log.date[3], log.date[4], log.date[5]),
            exercises: log.exercises
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(MSG.errorfetchingworkoutlogs, err);
        this.isLoading = false;
      },
    });
  } 
  getGroupedExercises(exercises: any[]): any[] {
    const groupedExercises: any[] = [];
    exercises.forEach((exercise: any) => {
      const existingExercise = groupedExercises.find(e => e.exerciseId === exercise.exerciseId);
    
      if (existingExercise) {
        existingExercise.sets.push(...exercise.sets);
      } else {
        groupedExercises.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: [...exercise.sets]
        });
      }
    });
  
    return groupedExercises;
  }

  viewWorkoutLog(log: any) {
    const groupedExercises = this.getGroupedExercises(log.exercises);
    this.selectedWorkoutLog = {
      ...log,
      exercises: groupedExercises
    };
  
    this.showModal = true;
  }


  closeWorkoutLogModal() {
    this.showModal = false;
    this.selectedWorkoutLog = null;
  }
}
