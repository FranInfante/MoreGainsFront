import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, switchMap, throwError } from 'rxjs';
import { User } from '../interfaces/users';
import { USER_ROUTES } from '../routes/user-routes';
import { MSG } from '../components/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authToken: string | null = null;
  private user: User | null = null;
  userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) { }

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

  loginUser(emailOrUsername: string, password: string): Observable<User> {
    const loginData = { email: emailOrUsername, password };
    return this.http.post<{ token: string }>(USER_ROUTES.authenticate(), loginData).pipe(
      switchMap(response => {
        const token = response.token;
        this.authToken = token;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.get<User>(USER_ROUTES.getinfo(), { headers });
      }),
      catchError(error => {
        console.error('Login failed with error:', error);
        let errorMessage: string;
        if (error.status === 401) {
          errorMessage = MSG.failedCredentials;
        } else {
          errorMessage = MSG.unknownLoginError;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getCurrentUser(): Observable<User> {
    if (!this.authToken) {
      console.error('No authentication token available.');
      return throwError(() => new Error('No authentication token available.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`
    });

    return this.http.get<User>(USER_ROUTES.getinfo(), { headers }).pipe(
      catchError(error => {
        console.error('Failed to fetch current user with error:', error);
        let errorMessage: string;
        if (error.status === 401) {
          errorMessage = MSG.unauthorized;
        } else {
          errorMessage = MSG.fetcherror;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setUser(user: User) {
    this.user = user;
    this.userSubject.next(user);
  }

  logout() {
    this.user = null;
    this.userSubject.next(null);
    this.authToken = null;
  }
}