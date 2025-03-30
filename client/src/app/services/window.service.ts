import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  reload(): void {
    window.location.reload();
  }
}
