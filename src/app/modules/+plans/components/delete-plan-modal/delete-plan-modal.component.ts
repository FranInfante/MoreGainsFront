import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-delete-plan-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-plan-modal.component.html',
  styleUrl: './delete-plan-modal.component.css'
})
export class DeletePlanModalComponent {
  @Input() planName!: string;
  @Output() planDeleted = new EventEmitter<void>();

  confirmDeletion(): void {
    this.planDeleted.emit();
  }
}
