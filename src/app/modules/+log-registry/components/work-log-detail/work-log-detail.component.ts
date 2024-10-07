import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-work-log-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-log-detail.component.html',
  styleUrl: './work-log-detail.component.css'
})
export class WorkoutLogDetailModalComponent {
  @Input() workoutLog: any;
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }
  onBackdropClick(event: MouseEvent) {
    this.onClose();
  }
}
