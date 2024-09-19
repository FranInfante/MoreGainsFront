import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdToastInline } from '../components/toast/toast.component'
import { BehaviorSubject, Subject } from 'rxjs';

interface Toast {
  id: number;
  show: boolean;
  body: string;
  type: 'success' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastState = new BehaviorSubject<Toast[]>([]);

  toastState$ = this.toastState.asObservable();
  private toastId = 0; // Unique ID for each toast

  showToast(body: string, type: 'success' | 'danger' | 'info') {
    const newToast: Toast = {
      id: this.toastId++,
      show: true,
      body,
      type
    };
    this.toasts.push(newToast);
    this.toastState.next([...this.toasts]);
  }

  removeToast(toastId: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== toastId);
    this.toastState.next([...this.toasts]);
  }
}
