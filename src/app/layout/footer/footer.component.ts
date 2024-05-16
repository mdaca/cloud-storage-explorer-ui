import { Component, OnInit } from '@angular/core';
import { DriveService } from '../../services/drive.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(public driveService: DriveService) {
    driveService.messages.subscribe(newMessages => { this.messageText = newMessages.join('\r\n'); });
    this.title = 'Audit Logs';

    setInterval(function() {
        driveService.getUserInProgress().subscribe((resp: any) => {
        driveService.setInProgress(resp.actionAudits);
      });
    }, 3000);


    driveService.inProgressItems.subscribe(newItems => { this.auditItems = newItems; });
   }
   
   opened: boolean = false;

   messageText: String = '';
  title: string = '';

  auditItems: any[] = [];

  ngOnInit(): void {
  }
  
  close() {
    this.opened = false;
  }

  abortCommit() {
    this.opened = false;
    this.driveService.abortInProgress(this.actionaudit.actionAuditId);
    this.driveService.addMessages([ (this.actionaudit.action == 'batch_copy' ? 'Copying of items ' : 'Moving of items ') + " to " + this.actionaudit.destPath + " has been cancelled.  " + this.actionaudit.bytesTransferred + ' of ' + this.actionaudit.totalBytes + ' were ' + (this.actionaudit.action == 'batch_copy' ? 'copied.' : 'copied.  Files may not been removed.') ]);
  }
  
  public actionaudit: any;
  
  abort(actionaudit: any) {
    console.log('aborting');
    this.opened = true;
    this.actionaudit = actionaudit;
  }

}
