import { Router, RouterModule } from '@angular/router';
import { User } from '../../../shared/interfaces/users';
import { UserService } from './../../../shared/service/user.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { ASSET_URLS, LOCATIONS } from '../../../shared/components/constants';
import { ToastService } from '../../../shared/service/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  formvalid = false;
  subscriptions: SubscriptionLike[] = [];
  ASSET_URLS: typeof ASSET_URLS = ASSET_URLS;

  constructor(private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      role: 'USER'
    })
  }

  createUser() {
    if (this.userForm.valid) {
      const user: User = {
        username: this.userForm.value.username,
        password: this.userForm.value.password,
        email: this.userForm.value.email,
        photoUrl: this.userForm.value.photoUrl,
        bio: this.userForm.value.bio,
        fitnessGoals: this.userForm.value.fitnessGoals,
        isTrainer: this.userForm.value.isTrainer,
        isAvailable: this.userForm.value.isAvailable,
        privacySetting: this.userForm.value.privacySetting
      };


      this.subscriptions.push(this.userService.createUser(user).subscribe(response => {
        this.formvalid = true;
        setTimeout(() => {
          this.formvalid = false;
        }, 2000)
        this.router.navigate([LOCATIONS.login]);
        this.userForm.reset();
      }));
    } if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
