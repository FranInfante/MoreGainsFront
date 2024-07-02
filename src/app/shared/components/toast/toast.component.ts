import { Component } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'ngbd-toast-inline',
	standalone: true,
	imports: [NgbToastModule, CommonModule],
	templateUrl: './toast.component.html'
})
export class NgbdToastInline {

	show = false;
  body = '';

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState$.subscribe(state => {
      this.show = state.show;
      this.body = state.body;
    });
  }
}
