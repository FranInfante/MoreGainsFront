import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { PlanService } from '../../shared/service/plan.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../shared/interfaces/plan';
import { User } from '../../shared/interfaces/users';
import { UserService } from '../../shared/service/user.service';
import { BackToMenuComponent } from '../../shared/components/back-to-menu/back-to-menu.component';
import { WorkoutsComponent } from "./components/workouts/workouts.component";
import { ASSET_URLS, TOAST_MSGS } from '../../shared/components/constants';
import { ToastService } from '../../shared/service/toast.service';
import { PlanHeaderComponent } from './components/plan-header/plan-header.component';
import { DeletePlanModalComponent } from "./components/delete-plan-modal/delete-plan-modal.component";
import { TabsComponent } from "./components/tabs/tabs.component";

@Component({
  selector: 'app-plan-tabs',
  standalone: true,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  imports: [CommonModule, FormsModule, BackToMenuComponent, WorkoutsComponent, PlanHeaderComponent, DeletePlanModalComponent, TabsComponent],
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  activePlanId: number | null = null;
  activePlan: Plan | null = null;
  currentUser: User | null = null;
  user: User | null = null;
  ThreeDotsIcon: string = ASSET_URLS.ThreeDotsIcon;

  PlusSignIcon: string = ASSET_URLS.PlusSignIcon;
  editMode = false;

  constructor(
    private planService: PlanService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.user = user;
      }
    });

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
        id: 0,
        name: `Plan ${this.plans.length + 1}`,
        userId: this.currentUser.id!,
        workouts: [],
      };
      this.planService.addPlan(newPlan).subscribe((plan) => {
        this.plans.push(plan);
        this.selectPlan(plan.id);
      });
    }
  }

  deletePlan(id: number): void {
    this.planService.deletePlan(id).subscribe(() => {
      this.plans = this.plans.filter(plan => plan.id !== id);
  
      if (this.activePlanId === id) {
        if (this.plans.length > 0) {
          this.selectPlan(this.plans[0].id);
        } else {
          this.activePlan = null;
          this.activePlanId = null;
        }
      }
    });
  }
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.toastService.showToast(TOAST_MSGS.editmode, 'info');
    }
  }
}
