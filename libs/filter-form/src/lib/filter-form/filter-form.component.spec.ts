import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterFormComponent } from './filter-form.component';
import { NotificationsFilter } from '@vacgaps/interfaces';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

const CITIES_LIST = new Map(Object.entries({
  0: '0',
  1: '1'
}));
@Component({
  selector: 'test-component',
  template: `<vacgaps-filter-form (formSubmit)="handleFormUpdate($event)"
                            [cityList]="cities"></vacgaps-filter-form>`,
})
class TestComponent {
  cities = CITIES_LIST;

  handleFormUpdate(data) {

  }
}
describe('FilterFormComponent', () => {
  let component: FilterFormComponent;
  let fixture: ComponentFixture<FilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterFormComponent, TestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a reactive form object`, function() {
    const formFieldNames = [
      'cities', 'healthCareService', 'availableVaccines', 'dueTimeInMs',
    ].sort();
    expect( Object.keys(component.filterFields.controls).sort()).toEqual(jasmine.arrayWithExactContents(formFieldNames));
  });

  it(`should submit the form data`, function() {
    const data: NotificationsFilter = {
      availableVaccines: Math.round(Math.random()*100),
      cities: ["100", "200"],
      dueTimeInMs: 0,
      healthCareService: '1'
    };
    component.filterFields.setValue(data);
    spyOn(component.formSubmit, 'emit');

    component.submitForm();

    expect(component.formSubmit.emit).toHaveBeenCalledWith(data);
  });

  it(`should output the form data to parent component`, function() {
    const parentFixture = TestBed.createComponent(TestComponent);
    const parentComponent = parentFixture.componentInstance;
    const formComponent: FilterFormComponent = parentFixture.debugElement.query(By.css('vacgaps-filter-form')).componentInstance;
    const data: NotificationsFilter = {
      availableVaccines: Math.round(Math.random()*100),
      cities: ["100", "200"],
      dueTimeInMs: 0,
      healthCareService: '1'
    };
    formComponent.filterFields.setValue(data);
    fixture.detectChanges();
    spyOn(parentComponent, 'handleFormUpdate');
    formComponent.submitForm();
    expect(parentComponent.handleFormUpdate).toHaveBeenCalledWith(data);
  });

  it(`should filter constants Map by string in the cities list`, function() {
    const map = new Map(Object.entries({
      0: 'test', 1: 'zest', 2: 'completelyDifferent', 3: 'TEST'
    }));
    component.cityList = map;
    fixture.detectChanges();
    const elementsBeforeFilter = component.citiesSelectList.size;

    component.filterCities('te');
    fixture.detectChanges();
    const elementsAfterFilter = component.citiesSelectList.size;

    expect(elementsBeforeFilter).toEqual(4);
    expect(elementsAfterFilter).toEqual(3);
  });

  it(`should receive cities list from parent via the cityList`, function() {
    const parentFixture = TestBed.createComponent(TestComponent);
    const formComponent = parentFixture.debugElement.query(By.css('vacgaps-filter-form')).componentInstance;
    parentFixture.detectChanges();

    expect(formComponent.citiesSelectList.size).toEqual(CITIES_LIST.size);
    for (const [key, value] of CITIES_LIST.entries()) {
      expect(value).toEqual(formComponent.citiesSelectList.get(key));
    }
  });
});
