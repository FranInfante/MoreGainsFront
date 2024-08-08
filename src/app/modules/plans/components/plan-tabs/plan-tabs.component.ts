import { Component, OnInit, Input } from '@angular/core';
import { PlanService } from '../../../../shared/service/plan.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../../../shared/interfaces/plan';
import { User } from '../../../../shared/interfaces/users';
import { UserService } from '../../../../shared/service/user.service';
@Component({
  selector: 'app-plan-tabs',
  standalone: true,
  templateUrl: './plan-tabs.component.html',
  styleUrls: ['./plan-tabs.component.css'],
  imports: [CommonModule, FormsModule],
})
export class PlanTabsComponent implements OnInit {
  plans: Plan[] = [];
  activePlanId: number | null = null;
  activePlan: Plan | null = null;
  currentUser: User | null = null;

  constructor(
    private planService: PlanService,
    private userService: UserService
  ) {}

  
  ngOnInit(): void {
    this.userService.userSubject.subscribe(user => {
      if (user && user.id !== undefined) {
        this.currentUser = user;
        this.fetchUserPlans(user.id);
      }
    });

    if (!this.currentUser) {
      this.userService.getCurrentUser().subscribe({
        next: (user: User) => {
          if (user.id !== undefined) {
            this.currentUser = user;
            this.fetchUserPlans(user.id);
          }
        }
      });
    }
  }
  fetchUserPlans(userId: number): void {
    this.planService.getPlansByUserId(userId).subscribe((plans) => {
      this.plans = plans;
      if (this.plans.length > 0) {
        this.selectPlan(this.plans[0].id);
      }
    });
  }

  selectPlan(id: number): void {
    this.activePlanId = id;
    this.planService.getPlanById(id).subscribe((plan) => {
      this.activePlan = plan ?? null;
    });
  }

  addPlan(): void {
    if (this.currentUser) {
      const newPlan: Plan = {
        id: this.plans.length + 1,
        name: `Plan ${this.plans.length + 1}`,
        user: this.currentUser,
        workouts: [],
      };
      this.planService.addPlan(newPlan).subscribe((plan) => {
        this.plans.push(plan);
        this.selectPlan(plan.id);
      });
    }
  }
}
