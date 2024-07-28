import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdToastInline } from '../components/toast/toast.component'
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastState = new BehaviorSubject<{ show: boolean, body: string, type: 'success' | 'danger', duration: number }>({ show: false, body: '', type: 'success', duration: 5000 });

  toastState$ = this.toastState.asObservable();

  showToast(body: string, type: 'success' | 'danger', duration = 5000) {
    this.toastState.next({ show: true, body, type, duration });
    setTimeout(() => {
      this.hideToast();
    }, duration);
  }

  hideToast() {
    this.toastState.next({ show: false, body: '', type: 'success', duration: 5000 });
  }
}
