import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-continue-or-reset-modal',
  standalone: true,
  imports: [],
  templateUrl: './continue-or-reset-modal.component.html',
  styleUrl: './continue-or-reset-modal.component.css'
})
export class ContinueOrResetModalComponent {
  constructor(public activeModal: NgbActiveModal) {}

  onContinue() {
    this.activeModal.close('continue');
  }

  onReset() {
    this.activeModal.close('reset');
  }

  onCancel() {
    this.activeModal.dismiss();
  }
}
