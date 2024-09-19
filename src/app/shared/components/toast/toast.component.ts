import { Component, OnInit } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'ngbd-toast-inline',
	standalone: true,
	imports: [NgbToastModule, CommonModule],
	templateUrl: './toast.component.html'
})
export class NgbdToastInline implements OnInit {
  toasts: { id: number; body: string; type: 'success' | 'danger' | 'info' }[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(toastId: number) {
    this.toastService.removeToast(toastId);
  }
}
