import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';

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

  toggleEditMode(): void {
    this.editModeToggle.emit();
  }

  deletePlan(): void {
    this.planDelete.emit();
  }
}
