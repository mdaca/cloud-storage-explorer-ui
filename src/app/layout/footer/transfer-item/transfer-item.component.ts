import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DriveService } from 'src/app/services/drive.service';

@Component({
  selector: 'app-transfer-item',
  templateUrl: './transfer-item.component.html',
  styleUrls: ['./transfer-item.component.scss']
})
export class TransferItemComponent implements OnInit {

  value: number = 22;

  @Input()
  public actionaudit: any;

  constructor(public driveService: DriveService) {

   }
   
  @Output()
  aborted = new EventEmitter<any>();

   messageText: String = '';
  title: string = '';

  ngOnInit(): void {
  }

  abort() {
    console.log('aborting');
    this.aborted.emit(this.actionaudit);
  }

}
