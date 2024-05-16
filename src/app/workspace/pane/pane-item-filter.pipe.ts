import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'callback',
    pure: false
})
export class PaneItemFilterPipe implements PipeTransform {
    transform(items: any[], filterText : string) : any {
        if (!items || !filterText) {
            return items;
        }
        return items.filter(item => filterText.length == 0 || item.displayName.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
    }
}