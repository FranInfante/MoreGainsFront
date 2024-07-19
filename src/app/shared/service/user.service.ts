import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { User } from '../interfaces/users';
import { ToastService } from './toast.service';
import { USER_ROUTES } from '../routes/user-routes';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User | null = null;
  userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.userSubject.next(this.user);
    }
  }

  private saveUserToLocalStorage(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private removeUserFromLocalStorage() {
    localStorage.removeItem('user');
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(USER_ROUTES.list());
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(USER_ROUTES.get(id));
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(USER_ROUTES.create(), user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(USER_ROUTES.update(id), user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(USER_ROUTES.delete(id));
  }

  loginUser(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post<any>(USER_ROUTES.login(), loginData).pipe(
      catchError(error => {
        if (error.status === 401) {
          return throwError('Correo electrónico o contraseña no válidos. Inténtalo de nuevo.');
        } else {
          return throwError('Se produjo un error al iniciar sesión. Vuelva a intentarlo más tarde.');
        }
      })
    );
  }

  setUser(user: User) {
    this.user = user;
    this.userSubject.next(user);
    this.saveUserToLocalStorage(user);
  }

  logout() {
    this.user = null;
    this.userSubject.next(null);
    this.removeUserFromLocalStorage();
  }
}
