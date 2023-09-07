import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FlatpickrOptions } from 'ng2-flatpickr';

import { AccountSettingsService } from 'app/main/pages/account-settings/account-settings.service';
import { ItemsService } from 'app/service/config';
import { User } from 'app/auth/models';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { environment } from 'environments/environment';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  // public
  public contentHeader: object;
  public data: any;
  public birthDateOptions: FlatpickrOptions = {
    altInput: true
  };
  public loginForm: FormGroup;
  public changePasswordForm: FormGroup;
  public passwordTextTypeOld = false;
  public passwordTextTypeNew = false;
  public passwordTextTypeRetype = false;
  public avatarImage: string;
  public imageUrl = environment.apiUrl;
  onSettingsChanged: BehaviorSubject<any>;
  currentUser: User;
  // private
  private _unsubscribeAll: Subject<any>;
  isSubmitted: boolean;
  isSubmittedPassword: boolean;
  /**
   * Constructor
   *
   * @param {AccountSettingsService} _accountSettingsService
   */
  constructor(private _accountSettingsService: AccountSettingsService, private _coreMenuService: CoreMenuService, private _formBuilder: FormBuilder) {
    this._unsubscribeAll = new Subject();
    this.onSettingsChanged = new BehaviorSubject({});
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Password Text Type Old
   */
  togglePasswordTextTypeOld() {
    this.passwordTextTypeOld = !this.passwordTextTypeOld;
  }

  /**
   * Toggle Password Text Type New
   */
  togglePasswordTextTypeNew() {
    this.passwordTextTypeNew = !this.passwordTextTypeNew;
  }

  getError(k, message) {
    const controlErrors: ValidationErrors = this.loginForm.get(k).errors;
    if (controlErrors !== null && this.isSubmitted) {
      return message;
    }
    return "";
  }

  getErrorPassword(k, message) {
    const controlErrors: ValidationErrors = this.changePasswordForm.get(k).errors;
    if (controlErrors !== null && this.isSubmittedPassword) {
      return message;
    }
    return "";
  }

  /**
   * Toggle Password Text Type Retype
   */
  togglePasswordTextTypeRetype() {
    this.passwordTextTypeRetype = !this.passwordTextTypeRetype;
  }

  /**
   * Upload Image
   *
   * @param event
   */
  uploadImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (event: any) => {
        this.avatarImage = event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
      const formData = new FormData();
      formData.append('userId', this.data.id)
      formData.append('file', event.target.files[0])
      new ItemsService().childPath('post', `User/UpdateUserProfile`, formData).then(response => {
        alert('Profile updated')
      })
    }
  }

  submit(data = this.loginForm.value) {
    // window.alert(subjectName + description)
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return
    }
    new ItemsService().childPath('post', 'User/AddUsers', { ...this.data, ...data }).then((e) => {
      this.ngOnInit()
    })

  }

  changePasswordSubmit(data = this.changePasswordForm.value) {
    // window.alert(subjectName + description)
    console.log(data, "maulik126")
    this.isSubmittedPassword = true;
    if (this.changePasswordForm.invalid) {
      return
    }
    // new ItemsService().childPath('post', 'User/AddUsers', { ...this.data, ...data }).then((e) => {
    //   this.ngOnInit()
    // })

  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {

    this.loginForm = this._formBuilder.group({
      userName: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
    });

    this.changePasswordForm = this._formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.currentUser = this._coreMenuService.currentUser;
      new ItemsService().childPath('get', `User/GetUserById?UserId=${this.currentUser.id}`).then(response => {
        this.data = response.data.data.table.length ? response.data.data.table[0] : {};
        this.avatarImage = this.imageUrl + '/' + this.data.profilePath
        this.onSettingsChanged.next(this.data);
        for (let key in this.loginForm.value) {
          this.loginForm.get(key).setValue(this.data[key])
        }
      })
    });


    // content header
    this.contentHeader = {
      headerTitle: 'Account Settings',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Pages',
            isLink: true,
            link: '/'
          },
          {
            name: 'Account Settings',
            isLink: false
          }
        ]
      }
    };
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
