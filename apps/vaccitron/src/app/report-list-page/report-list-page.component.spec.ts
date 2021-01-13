import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReportListPageComponent } from './report-list-page.component';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationsFilter, VaccinesReport } from '@vacgaps/interfaces';
import { By } from '@angular/platform-browser';
import { FilterFormModule } from '@vacgaps/filter-form';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VaccinesReportsService } from '@vacgaps/vaccines-reporter';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

const MOCK_REPORTS = require('../../assets/demo-data.json');

@Component({
  selector: 'test-component',
  template: `<vacgaps-report-list-page
    [reportsList]="reportsList"
  ></vacgaps-report-list-page>`,
})
class TestComponent {
  reportsList: VaccinesReport[] = MOCK_REPORTS;

}
describe('ReportListPageComponent', () => {
  let component: ReportListPageComponent;
  let fixture: ComponentFixture<ReportListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [VaccinesReportsService],
      imports: [FilterFormModule, NoopAnimationsModule, HttpClientTestingModule],
      declarations: [ReportListPageComponent, TestComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`integrations`, function() {
    let parentFixture: ComponentFixture<TestComponent>,
      parentComponent: TestComponent,
      reportListComponent: ReportListPageComponent;

    beforeEach(function () {
      parentFixture = TestBed.createComponent(TestComponent);
      parentComponent = parentFixture.componentInstance;
      reportListComponent = parentFixture.debugElement.query(
        By.css('vacgaps-report-list-page')
      ).componentInstance;
      parentFixture.detectChanges();
    });

    it(`should get a list of reports from parent`, function() {
      expect(reportListComponent.reportsList).toEqual(parentComponent.reportsList);
    });

    it(`should update the filter when the filter fields change`, function() {
      const notificationsFilter: NotificationsFilter = {
        cities: ["100", "110"],
        healthCareService: "1",
        availableVaccines: 50,
        dueTimeInMs: 500,
      };
      const filterComponent = parentFixture.debugElement.query(By.css('vacgaps-filter-form')).componentInstance;
      spyOn(reportListComponent, 'updateFilter');
      filterComponent.filterFields.setValue(notificationsFilter);
      expect(reportListComponent.updateFilter).toHaveBeenCalledWith(notificationsFilter);
    });
  });

  describe(`sync tests`, function() {
    beforeEach(function() {
      fixture.detectChanges();
    });

    it(`should return the data according to incoming filter`, function() {
      component.reportsList = MOCK_REPORTS;
      const notificationsFilter: NotificationsFilter = {
        cities: ["100", "110"],
        healthCareService: "1"
      };
      component.updateFilter(notificationsFilter);
      expect(component.filteredReportsList).toEqual([
        {
          city: '100',
          healthCareService: '1',
          address: 'שרה אמנו 39'
        },
        {
          city: '110',
          healthCareService: '1',
          address: 'שרה אמנו 39'
        },
      ])
    });

    it(`should return data with all cities if got an empty cities filter`, function() {
      component.reportsList = MOCK_REPORTS.map(value => { value.healthCareService = "1"; return value; });
      const notificationsFilter: NotificationsFilter = {
        cities: [],
        healthCareService: "1"
      };
      component.updateFilter(notificationsFilter);
      expect(component.filteredReportsList).toEqual(MOCK_REPORTS.map(value => { value.healthCareService = "1"; return value; }));
    });

    it(`should query the server according to environment for reports on load`, function() {
      const fakeReportList = [{test: 'data'}] as unknown as VaccinesReport[];
      const vaccinesReportsService = TestBed.inject(VaccinesReportsService);
      spyOn(vaccinesReportsService, 'getVaccinesReports').and.returnValue(of(fakeReportList));

      component.ngOnInit();

      expect(component.reportsList).toEqual(fakeReportList);
    });
  });

  it(`should query the server every ${environment.reportsQueryInterval} ms`, fakeAsync(function() {
    fixture.detectChanges();
    const fakeReportLists = [
      [{list1: 'data'}] as unknown as VaccinesReport[],
      [{list2: 'data'}] as unknown as VaccinesReport[],
      [{list3: 'data'}] as unknown as VaccinesReport[],
    ];

    const vaccinesReportsService = TestBed.inject(VaccinesReportsService);
    let iteration = 0;
    spyOn(vaccinesReportsService, 'getVaccinesReports').and.callFake(() => of(fakeReportLists[iteration]));
    fakeReportLists.forEach(fakeReport => {
      tick(environment.reportsQueryInterval);
      expect(component.reportsList).toEqual(fakeReport);
      iteration++;
    });

    discardPeriodicTasks();
  }));

  it(`should stop querying when destroying the component`, fakeAsync(function() {
    fixture.detectChanges();
    component.ngOnDestroy();
    const getUpdateSpy = spyOn(component, 'getUpdate');
    tick(environment.reportsQueryInterval);
    expect(getUpdateSpy.calls.count()).toEqual(0);
  }));
});
