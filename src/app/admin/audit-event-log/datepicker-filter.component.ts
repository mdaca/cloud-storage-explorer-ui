import { Component, Input } from '@angular/core';
import { FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'my-datepicker-filter',
    template: `
    <kendo-datepicker
      [format]="'M/d/yyyy'"
      (valueChange)="onChange($event)"
      [value]="selectedValue">
    </kendo-datepicker>
  `
})
export class DatePickerFilterComponent extends BaseFilterCellComponent {

    public get selectedValue(): any {
        const filter = this.filterByField(this.valueField);
        return filter ? filter.value : null;
    }

    @Input() public filter: any;
    @Input() public valueField: string = '';

    constructor(filterService: FilterService) {
        super(filterService);
    }

    public onChange(value: any): void {
        this.applyFilter(
            value === null ? // value of the default item
                this.removeFilter(this.valueField) : // remove the filter
                this.updateFilter({ // add a filter for the field with the value
                    field: this.valueField,
                    operator: 'eq',
                    value: new Date(value)
                })
        ); // update the root filter
    }
}
