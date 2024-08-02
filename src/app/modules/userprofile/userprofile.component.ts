import { Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
import { NgIf } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { ASSET_URLS, LOCATIONS } from '../../shared/components/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  userId: number = 1;
  user!: User;
  isEditing: boolean = false;
  subscriptions: SubscriptionLike[] = [];
  userIcon = ASSET_URLS.genericlogo;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.gatherUserId();
    this.initForm();
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

  gatherUserId() {
    this.subscriptions.push(this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.userId = user?.id;
      }
    }));
  }

  initForm() {
    this.userForm = new FormGroup({
      name: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]),
      surname: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]),
      username: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]),
      password: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]),
      email: new FormControl({ value: '', disabled: true }, [Validators.email]),
      dni: new FormControl({ value: '', disabled: true }, [Validators.pattern(/^\d{8,9}[A-Za-z]?$/)]),
      phone: new FormControl({ value: '', disabled: true }, [Validators.pattern(/^[0-9]{9}$/)]),
      postcode: new FormControl({ value: '', disabled: true }, [Validators.pattern(/^[0-9]{5}$/)]),
      address: new FormControl({ value: '', disabled: true }, [Validators.required]),
      available: new FormControl({ value: true, disabled: true })
    });
  }

  loadUser() {
    this.subscriptions.push(this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        this.user = data;
        this.userForm.patchValue(data);
      }
    }));
  }

  updateUser() {
    if (this.userForm.valid) {
      this.subscriptions.push(this.userService.updateUser(this.userId, this.userForm.value).subscribe({
        next: () => {
          this.loadUser();
          this.userService.fetchAndSetUser();
          this.userForm.disable();
          this.isEditing = false;
        }
      }));
    }
  }

  deactivateAccount() {
    this.userForm.enable();
    this.userForm.get('available')!.setValue(false);
    this.updateUser();
    this.userService.logout();
    this.router.navigate([LOCATIONS.menu]);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userForm.enable();
    } else {
      this.userForm.disable();
    }
  }

  toggleCancel() {
    if (this.isEditing){
      this.toggleEdit();
      this.loadUser();
    }
  }
}
