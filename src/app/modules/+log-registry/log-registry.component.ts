import { Component, OnInit } from '@angular/core';
import { WorkoutLogService } from '../../shared/service/workoutlog.service';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-registry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-registry.component.html',
  styleUrl: './log-registry.component.css'
})
export class LogRegistryComponent implements OnInit {
  userId!: number;
  workoutLogs: any[] = [];
  isLoading: boolean = true;

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
          console.error('User ID is undefined.');
        }
      },
      error: (err) => {
        console.error('Failed to get user ID:', err);
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
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching workout logs:', err);
        this.isLoading = false;
      },
    });
  }

  viewWorkoutLog(logId: number) {
    this.router.navigate(['/log', logId]);
  }
}
