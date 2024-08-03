import { Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
import { CommonModule, NgIf } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { ASSET_URLS, LOCATIONS } from '../../shared/components/constants';
import { Router } from '@angular/router';
import { PrivacySetting } from '../../shared/interfaces/enums/EnumPrivacySetting';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  userId: number | null = null; 
  user?: User;
  isEditing: boolean = false;
  subscriptions: SubscriptionLike[] = [];
  userIcon = ASSET_URLS.genericlogo;
  privacySettings = Object.values(PrivacySetting);

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    
    this.initForm();
    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe(user => {
        if (user && user.id) {
          this.userId = user.id;
          this.loadUser();
        } else {
          console.error('Failed to get user ID.');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  gatherUserId() {
    this.subscriptions.push(this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.userId = user.id;
      }
    }));
  }

  initForm() {
    this.userForm = new FormGroup({
      username: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]),
      password: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
      bio: new FormControl({ value: '', disabled: true }),
      privacySetting: new FormControl({ value: '', disabled: true }, [Validators.required]),
      isAvailable: new FormControl({ value: '', disabled: true })
    });
  }

  loadUser() {
    if (this.userId !== null) {
      this.subscriptions.push(
        this.userService.getUserById(this.userId).subscribe({
          next: (data) => {
            this.user = data;
            this.userForm.patchValue(data);
          }
        })
      );
    } 
  }

  updateUser() {
    if (this.userId !== null && this.userForm.valid) {
      this.subscriptions.push(
        this.userService.updateUser(this.userId, this.userForm.getRawValue()).subscribe({
          next: () => {
            this.loadUser();
            this.userService.fetchAndSetUser();
            this.userForm.disable();
            this.isEditing = false;
          }
        })
      );
    }
  }

  deactivateAccount() {
    this.userForm.enable();
    this.userForm.get('isAvailable')!.setValue(false);
    this.updateUser();
    this.userService.logout();
    this.router.navigate([LOCATIONS.menu]);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userForm.enable();
      this.userForm.get('isAvailable')!.disable();
    } else {
      this.userForm.disable();
    }
  }

  toggleCancel() {
    if (this.isEditing) {
      this.toggleEdit();
      this.loadUser();
    }
  }
}