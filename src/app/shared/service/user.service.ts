import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, switchMap, throwError } from 'rxjs';
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

  constructor(private http: HttpClient) {
    this.authToken = localStorage.getItem('authToken'); 
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

  loginUser(emailOrUsername: string, password: string): Observable<User> {
    const loginData = { email: emailOrUsername, password };
    return this.http.post<{ token: string }>(USER_ROUTES.authenticate(), loginData).pipe(
      switchMap(response => {
        const token = response.token;
        this.authToken = token;
        this.setAuthToken(token);
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.get<User>(USER_ROUTES.getinfo(), { headers });
      }),
      catchError(error => {
        console.error(MSG.loginerror, error);
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
      console.error(MSG.noauthtoken);
      return throwError(() => new Error(MSG.notoken));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`
    });

    return this.http.get<User>(USER_ROUTES.getinfo(), { headers }).pipe(
      catchError(error => {
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
    localStorage.setItem('authToken', token);
  }

  setUser(user: User) {
    this.user = user;
    this.userSubject.next(user);
  }

  logout() {
    this.user = null;
    this.userSubject.next(null);
    this.authToken = null;
    localStorage.removeItem('authToken');
  }
  fetchAndSetUser(): void {
    if (this.getToken()) {
      this.showinfo().subscribe(user => {
        this.setUser(user);
      });
    }
  }
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  showinfo() {
    return this.http.get<any>(USER_ROUTES.getinfo())
  }
  uploadProfilePicture(formData: FormData): Observable<{ imageUrl: string }> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.authToken}`,
        'Accept': 'application/json'
    });

    return this.http.post<{ imageUrl: string }>(USER_ROUTES.uploadProfilePicture(), formData, { headers }).pipe(
      
        map(response => {
            if (response && response.imageUrl) {
                return response;
            } else {
                throw new Error(MSG.invalidformat);
            }
        }),
        catchError((error) => {
            return throwError(() => new Error(MSG.errorupload));
        })
    );
}

}