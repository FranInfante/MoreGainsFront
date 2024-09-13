import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';
import { PlanService } from '../../../../shared/service/plan.service';
import { PLAN_ROUTES } from '../../../../shared/routes/plan-routes';

@Component({
  selector: 'app-plan-header',
  standalone: true,
  templateUrl: './plan-header.component.html',
  styleUrls: ['./plan-header.component.css']
})
export class PlanHeaderComponent {
  @Input() activePlan!: Plan;
  @Input() threeDotsIcon!: string;
  @Output() editModeToggle = new EventEmitter<void>();
  @Output() planDelete = new EventEmitter<void>();
  @Output() planNameUpdated = new EventEmitter<Plan>(); 

  constructor(private planService : PlanService){

  }

  toggleEditMode(): void {
    this.editModeToggle.emit();
  }

  deletePlan(): void {
    this.planDelete.emit();
  }

  updatePlanName(): void {
    const newName = (document.querySelector('h3') as HTMLElement)?.innerText.trim();
  
    if (newName && newName !== this.activePlan.name) {
      this.planService.updatePlanName(this.activePlan.id, newName).subscribe({
        next: (updatedPlan) => {
          this.planNameUpdated.emit(updatedPlan);
        },
        error: (error) => {
          console.error('Error updating plan name:', error);
        }
      });
    }
  }
  
}
