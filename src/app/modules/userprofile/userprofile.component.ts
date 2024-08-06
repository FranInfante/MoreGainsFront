import { Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
import { CommonModule, NgIf } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { ASSET_URLS, LOCATIONS, TOAST_MSGS } from '../../shared/components/constants';
import { Router } from '@angular/router';
import { PrivacySetting } from '../../shared/interfaces/enums/EnumPrivacySetting';
import { ToastService } from '../../shared/service/toast.service';
import { BASE } from '../../shared/routes/user-routes';
import { BackToMenuComponent } from "../../shared/components/back-to-menu/back-to-menu.component";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, CommonModule, BackToMenuComponent],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  passwordForm!: FormGroup;
  userId: number | null = null;
  user?: User;
  isEditing: boolean = false;
  subscriptions: SubscriptionLike[] = [];
  userIcon: string | null = null;
  privacySettings = Object.values(PrivacySetting);
  selectedFile: File | null = null;
  isPlaceholderVisible: boolean = false;

  constructor(private userService: UserService,
              private router: Router,
              private toastService: ToastService,
              private elementRef: ElementRef) {}

  ngOnInit() {
    this.initForm();
    this.initPasswordForm();
    this.subscriptions.push(
      this.userService.getCurrentUser().subscribe(user => {
        if (user && user.id) {
          this.userId = user.id;
          this.loadUser();
          this.userIcon = user.photoUrl ? `${BASE}${user.photoUrl}` : ASSET_URLS.genericlogo;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  initForm() {
    this.userForm = new FormGroup({
      username: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
      bio: new FormControl({ value: '', disabled: true }),
      privacySetting: new FormControl({ value: '', disabled: true }, [Validators.required]),
      isAvailable: new FormControl({ value: '', disabled: true })
    });
  }

  initPasswordForm() {
    this.passwordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator: ValidatorFn = (formGroup: AbstractControl): { [key: string]: any } | null => {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
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

  changePassword() {
    if (this.userId !== null && this.passwordForm.valid) {
      const newPassword = this.passwordForm.get('newPassword')?.value;
      const updatedUser = { password: newPassword } as User;
      this.userService.updateUser(this.userId, updatedUser).subscribe({
        next: () => {
          this.passwordForm.reset();
          this.toastService.showToast(TOAST_MSGS.modifiedpassword, 'success');
          this.closeModal('#changePasswordModal');
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadProfilePicture() {
    if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.userService.uploadProfilePicture(formData).subscribe({
            next: (response) => {
                this.userIcon = `${BASE}${response.imageUrl}`;
                
                this.toastService.showToast(TOAST_MSGS.successfulimg, 'success');
                this.closeModal('#uploadProfilePictureModal');
            },
            error: (error) => {
                this.toastService.showToast(TOAST_MSGS.erroruploadimg, 'danger');
            }
        });
    }
}
  closeModal(modalId: string) {
    const modalElement = this.elementRef.nativeElement.querySelector(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
    }
  }
  showPlaceholder() {
    this.isPlaceholderVisible = true;
  }

  hidePlaceholder() {
    this.isPlaceholderVisible = false;
  }
}