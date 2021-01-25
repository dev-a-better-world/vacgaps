import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotificationsFilter, VaccinesReport } from '@vacgaps/interfaces';
import { VaccinesReportsService } from '@vacgaps/vaccines-reporter';
import { interval, Subject } from 'rxjs';
import { CITIES } from '@vacgaps/constants';
import { environment } from '../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'vacgaps-report-list-page',
  templateUrl: './report-list-page.component.html',
  styleUrls: ['./report-list-page.component.css'],
})
export class ReportListPageComponent implements OnInit, OnDestroy {
  @Input()
  reportsList: VaccinesReport[] = [];
  #onDestroy$ = new Subject<void>();

  get isLoggedIn(): boolean {
    return this.accountService?.loggedIn;
  }

  get filteredReportsList(): VaccinesReport[] {
    return this.filterList(this.#currentFilter);
  }

  #currentFilter: NotificationsFilter = { healthCareService: '' };

  updateFilter(newFilter: NotificationsFilter) {
    this.#currentFilter = newFilter;
  }

  constructor(
    private vaccinesReportsService: VaccinesReportsService,
    private accountService?: AccountService
  ) {}

  ngOnInit(): void {
    this.getUpdate();
    interval(environment.reportsQueryIntervalInMs)
      .pipe(takeUntil(this.#onDestroy$))
      .subscribe(() => this.getUpdate());
  }

  getUpdate() {
    this.vaccinesReportsService
      .getVaccinesReports(environment.vaccinesDataUrl)
      .subscribe((data) => {
        this.reportsList = data;
      });
  }

  filterList(notificationsFilter: NotificationsFilter): VaccinesReport[] {
    return this.reportsList?.filter((report) => {
      return (
        (!notificationsFilter.healthCareService ||
          report.healthCareService === notificationsFilter.healthCareService) &&
        (!notificationsFilter.cities?.length ||
          notificationsFilter.cities.includes(report.city)) &&
        (!notificationsFilter.districts?.length ||
          notificationsFilter.districts.includes(CITIES[report.city].district))
      );
      // TODO::add the time filter according to how it is supposed to be sent from the server (don't forget to update the interface)
    });
  }

  ngOnDestroy(): void {
    this.#onDestroy$.next();
  }

  reportsListActionEvent(event) {
    this.accountService.login();
  }
}
