import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { PlanService } from '../../shared/service/plan.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../shared/interfaces/plan';
import { User } from '../../shared/interfaces/users';
import { UserService } from '../../shared/service/user.service';
import { BackToMenuComponent } from '../../shared/components/back-to-menu/back-to-menu.component';
import { WorkoutsComponent } from "./components/workouts/workouts.component";

@Component({
  selector: 'app-plan-tabs',
  standalone: true,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  imports: [CommonModule, FormsModule, BackToMenuComponent, WorkoutsComponent],
})
export class PlansComponent implements OnInit, AfterViewChecked {
  plans: Plan[] = [];
  activePlanId: number | null = null;
  activePlan: Plan | null = null;
  currentUser: User | null = null;
  user: User | null = null;

  private isNewPlanAdded = false;

  @ViewChild('navTabs', { static: false }) navTabs!: ElementRef<HTMLUListElement>;

  constructor(
    private planService: PlanService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
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
        id: this.plans.length + 1,
        name: `Plan ${this.plans.length + 1}`,
        userId: this.currentUser.id!,
        workouts: [],
      };
      this.planService.addPlan(newPlan).subscribe((plan) => {
        this.plans.push(plan);
        this.selectPlan(plan.id);
        this.isNewPlanAdded = true;
        this.cdr.detectChanges();
      });
    }
  }

  scrollToRight(): void {
    if (this.navTabs) {
      const navTabsElement = this.navTabs.nativeElement;
      const maxScrollLeft = navTabsElement.scrollWidth - navTabsElement.clientWidth;
      navTabsElement.scrollTo({
        left: maxScrollLeft,
        behavior: 'smooth'
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.isNewPlanAdded) {
      this.scrollToRight();
      this.isNewPlanAdded = false;
    }
  }
}
