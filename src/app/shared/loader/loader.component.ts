import { Component, OnDestroy } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnDestroy {
  public isLoading = false;
  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe(value => {
      this.isLoading = value;
    });
  }

  ngOnDestroy(): void {
    this.loaderService.isLoading.unsubscribe();
  }
}
