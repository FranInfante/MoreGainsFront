import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdToastInline } from '../components/toast/toast.component'
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastState = new BehaviorSubject<{ show: boolean, body: string, type: 'success' | 'danger' | 'info' }>({ show: false, body: '', type: 'success'});

  toastState$ = this.toastState.asObservable();

  showToast(body: string, type: 'success' | 'danger' | 'info') {
    this.toastState.next({ show: true, body, type});
  }
}
