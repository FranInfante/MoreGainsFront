import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { LOCATIONS, MSG, TOAST_MSGS } from '../../../shared/components/constants';
import { UserService } from '../../../shared/service/user.service';
import { ToastService } from '../../../shared/service/toast.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loginError: string | null = null;
  subscription?: SubscriptionLike;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

  constructor(private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastService.showToast('Please fill out all fields.', 'danger');
      return;
    }

    const loginData = this.loginForm.value;
    this.subscription = this.userService.loginUser(loginData.email, loginData.password).subscribe(user => {
      if (user) {
        this.userService.setUser(user);
        this.router.navigate([LOCATIONS.menu]);
        this.toastService.showToast(TOAST_MSGS.login, 'success');
      } else {
        this.loginError = MSG.failedPassword;
        this.toastService.showToast(MSG.failedPassword, 'danger');
      }
    },
    error => {
      const errorMsg = error === MSG.failedPassword ? MSG.failedPassword : MSG.unknownLoginError;
      this.loginError = errorMsg;
      this.toastService.showToast(errorMsg, 'danger');
    });
  }
}
