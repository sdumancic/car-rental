import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppStore } from './app.store';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  // Add other response fields as needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8090/v1/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private store: AppStore) {
    // Load user from localStorage on service init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        // Store user data and tokens
        if (response) {
          // Store username for refresh token
          if (response.user?.username) {
            localStorage.setItem('username', response.user.username);
          } else {
            localStorage.setItem('username', username);
          }

          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);

          // Store accessToken if provided
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }

          // Store refreshToken if provided
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }
      })
    );
  }

  refreshAccessToken(): Observable<LoginResponse> {
    const username = localStorage.getItem('username');

    if (!username) {
      throw new Error('No username found for token refresh');
    }

    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh_token`, {
      username
    }).pipe(
      tap(response => {
        // Update tokens after refresh
        if (response) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);

          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }

          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }
      })
    );
  }

  logout(): void {
    // Remove user and tokens from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    // Clear userId and roles from store
    this.store.clearUserId();
    this.store.clearUserRoles();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8090/v1/users/username/${username}`).pipe(
      tap(user => {
        // Store userId in AppStore after fetching user
        if (user && user.id) {
          console.log("Storing user ID in AppStore:", user.id);
          this.store.setUserId(user.id);
        }
      })
    );
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8090/v1/users/${userId}`);
  }

  getUserRoles(): Observable<any> {
    return this.http.get<any>('http://localhost:8090/v1/auth/roles').pipe(
      tap(response => {
        // Store roles in AppStore after fetching
        if (response && response.roles) {
          this.store.setUserRoles(response.roles);
        }
      })
    );
  }

  getUserId(): number | null {
    return this.store.getUserId();
  }
}

