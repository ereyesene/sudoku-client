import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConstants } from '../constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AppConfigurationService {

  constructor(private httpClient: HttpClient) { }

  public getConfig(): void {
    this.httpClient.get(AppConstants.CONFIG_LOCATION).subscribe(response => {
      localStorage.setItem(AppConstants.API_BASE_URL, response[AppConstants.API_BASE_URL]);
    });
  }
}
