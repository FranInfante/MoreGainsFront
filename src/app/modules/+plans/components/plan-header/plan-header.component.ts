import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';
import { PlanService } from '../../../../shared/service/plan.service';
import { PLAN_ROUTES } from '../../../../shared/routes/plan-routes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-header',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './plan-header.component.html',
  styleUrls: ['./plan-header.component.css']
})
export class PlanHeaderComponent {
  @Input() activePlan!: Plan;
  @Input() threeDotsIcon!: string;
  @Input() workouts: any[] = [];
  @Output() editModeToggle = new EventEmitter<void>();
  @Output() planDelete = new EventEmitter<void>();
  @Output() planNameUpdated = new EventEmitter<Plan>();

  maxLen = 20;
  specialKeys = ['Backspace', 'Shift', 'Control', 'Alt', 'Delete'];
  navigationalKeys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

  constructor(private planService: PlanService) {}

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

  onKeyDown(event: KeyboardEvent): boolean {
    const input = event.target as HTMLElement;
    const len = input.innerText.trim().length;
    let hasSelection = false;
    const selection = window.getSelection();
    const key = event.key;

    const isSpecial = this.specialKeys.includes(key);
    const isNavigational = this.navigationalKeys.includes(key);

    if (selection) {
      hasSelection = !!selection.toString();
    }

    if (isSpecial || isNavigational) {
      return true;
    }

    if (len >= this.maxLen && !hasSelection) {
      event.preventDefault();
      return false;
    }

    return true;
  }
}
