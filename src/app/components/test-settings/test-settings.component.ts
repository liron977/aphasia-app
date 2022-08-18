import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TestInfo } from 'src/app/shared/models/test-info.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EquizInfraService } from 'src/app/shared/services/equiz-infra.service';
import { ErrorInfra } from 'src/app/shared/services/error-infra.service';
import { ConfirmationDialogComponent } from '../utils/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-test-settings',
  templateUrl: './test-settings.component.html',
  styleUrls: ['./test-settings.component.scss']
})
export class TestSettingsComponent implements OnInit {

  currentTest:TestInfo;
  disableTests:TestInfo[];

  constructor(
    public authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    public testService:EquizInfraService,
    public messageInfra: ErrorInfra,
    private _snackBar: MatSnackBar,) 
    { }

  ngOnInit(): void {
    setTimeout(async () => {
      this.updateTest()      
    }, 500)
  }

  getTests()
  {
    this.currentTest=this.testService.getActiveTest();
    this.disableTests=this.testService.getDisactiveTest();
  }

  updateTest()
  {
    let promise=this.testService.getTestsByEmail(this.authService.patientOfTherapist.email);
    promise.then((data) => {
      this.testService.tests = data;
      this.getTests();
    })
  }

  navigateToCreateTest()
  {
    if(this.currentTest===undefined)
    {
      this.router.navigate(['create-test']);
    }
    else
    {
      this.messageInfra.openSimleSnackBar('לא ניתן להוסיף את המבחן, כבר קיים מבחן מופעל במערכת ', 'סגור');
    }
  }

  deleteTestInfo(test:TestInfo)
  {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{ data: {name: "למחוק"}});
     dialogRef.afterClosed().subscribe(result => {
       if(result)
      {
        setTimeout(async () => {
          this.testService.deleteTestInfo(test);
          this.updateTest()      
        }, 500)
      }
    });
  }

  disActivateTestInfo(test:TestInfo)
  {
    setTimeout(async () => {
      this.testService.updateDisActivateTest(test);
      this.updateTest()      
    }, 500)
    this._snackBar.open('המבחן כובה בהצלחה', 'סגור');
  }

  activateTestInfo(test:TestInfo)
  {
    if(this.currentTest===undefined)
    {
      setTimeout(async () => {
        this.testService.updateActivateTest(test);
        this.updateTest()      
      }, 500)
      this._snackBar.open('המבחן הופעל מחדש', 'סגור');
    }
    else
    {
      this.messageInfra.openSimleSnackBar('לא ניתן להוסיף את המבחן, כבר קיים מבחן מופעל במערכת ', 'סגור');
    }
  }

  toDate(date: Date){ 
    let dateNew = new Date(date).toLocaleDateString();
    return dateNew;
  }
}
