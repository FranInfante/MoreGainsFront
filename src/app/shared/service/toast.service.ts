import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdToastInline } from '../components/toast/toast.component'
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastState = new BehaviorSubject<{ show: boolean, body: string }>({ show: false, body: '' });

  toastState$ = this.toastState.asObservable();

  showToast(body: string) {
    this.toastState.next({ show: true, body });
    console.log('showToast', body);
  }

  hideToast() {
    this.toastState.next({ show: false, body: '' });
  }
}
