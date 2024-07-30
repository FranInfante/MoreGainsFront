import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription, SubscriptionLike } from 'rxjs';
import { LOCATIONS, MSG, TOAST_MSGS } from '../../../shared/components/constants';
import { UserService } from '../../../shared/service/user.service';
import { ToastService } from '../../../shared/service/toast.service';
import { isIdentifier } from '@angular/compiler';

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
  private subscription: Subscription = new Subscription();
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastService.showToast(TOAST_MSGS.fillallfields, 'danger');
      return;
    }

    const loginData = this.loginForm.value;

    this.subscription.add(
      this.userService.loginUser(loginData.identifier, loginData.password).subscribe({
        next: (user) => {
          if (user) {
            this.userService.setUser(user);
            this.router.navigate([LOCATIONS.menu]);
            this.toastService.showToast(TOAST_MSGS.login, 'success');
          } else {
            this.loginError = MSG.failedCredentials;
            this.toastService.showToast(MSG.failedCredentials, 'danger');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          const errorMsg = error.message === MSG.failedCredentials ? MSG.failedCredentials : MSG.unknownLoginError;
          this.loginError = errorMsg;
          this.toastService.showToast(errorMsg, 'danger');
        }
      })
    );
  }
}