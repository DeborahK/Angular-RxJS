import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private suppliersUrl = 'api/suppliers';

  // All Suppliers
  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl)
    .pipe(
      tap(data => console.log('suppliers: ', JSON.stringify(data))),
      shareReplay(),
      catchError(this.handleError)
    );

  suppliersWithConcatMap$ = of(1, 5, 8)
    .pipe(
      tap(item => console.log('concatMap outer Observable', item)),
      concatMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    ).subscribe(
      item => console.log('concatMap inner Observable', item)
    );

  supplierWithMergeMap$ = of(1, 5, 8)
    .pipe(
      tap(item => console.log('mergeMap outer Observable', item)),
      mergeMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    ).subscribe(
      item => console.log('mergeMap inner Observable', item)
    );

  supplierWithSwitchMap$ = of(1, 5, 8)
    .pipe(
      tap(item => console.log('switchMap outer Observable', item)),
      switchMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    ).subscribe(
      item => console.log('switchMap inner Observable', item)
    );
  constructor(private http: HttpClient) { }

  // Gets set of suppliers given a set of ids
  // This has to be a method because it has a parameter.
  getSuppliersByIds(ids: number[]): Observable<Supplier[]> {
    // Build the list of http calls
    const calls: Observable<Supplier>[] = [];
    ids.map(id => {
      const url = `${this.suppliersUrl}/${id}`;
      calls.push(this.http.get<Supplier>(url));
    });
    // Join the calls
    return forkJoin(calls).pipe(
      tap(data => console.log('getSuppliersByIds: ', JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
