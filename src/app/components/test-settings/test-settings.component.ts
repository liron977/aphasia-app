import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ignoreElements } from 'rxjs-compat/operator/ignoreElements';
import { TestInfo } from 'src/app/shared/models/test-info.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryInfraService } from 'src/app/shared/services/category-infra.service';
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
  message1 = "";
  message2 = "";

  constructor(
    public authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    public testService:EquizInfraService,
    public messageInfra: ErrorInfra,
    private _snackBar: MatSnackBar,
    public categoryService:CategoryInfraService) 
    { }

  ngOnInit(): void {
    setTimeout(async () => {
      this.updateTest()      
    }, 500)
  }

  getTests()
  {
    this.currentTest=this.testService.getActiveTest();
    this.disableTests=this.testService.getDisactiveTest().sort((a,b) => (this.wasPlayed(a) < this.wasPlayed(b)) ? 1 : ((this.wasPlayed(a) > this.wasPlayed(b)) ? -1 : 0));
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
    if(this.categoryService.getAllUserPhrases.length < 10)
    {
      this.messageInfra.openSimleSnackBar('כעת מספר המילים במערכת קטן מעשר ולכן לא ניתן ליצור משחק', 'סגור');
    } 
    else if(this.testService.validWords() === true){
      this.messageInfra.openSimleSnackBar('כעת מספר המילים המשוייכות לקטגוריות בהן יש יותר מ4 מילים קטן מ10', 'סגור');
    }
    else if(this.currentTest===undefined)
    {
      this.router.navigate(['create-test']);
    }
    else
    {
      this.messageInfra.openSimleSnackBar('לא ניתן להוסיף את המבחן, כבר קיים מבחן מופעל במערכת ', 'סגור');
    }
  }

  canBeEnabled(test: string[]){
    let flag = true;
    let allWords = this.categoryService.getAllUserPhrases;
    for(let i=0;i<test.length && flag;i++){
      if(allWords.some((word)=> { return word.name === test[i]}) === false)
      {
        flag = false;
      }
      else{
        let wordTemp = allWords.find((word)=> {return word.name === test[i]});
        let tempArray = allWords.filter(word => word.categoryID === wordTemp.categoryID);
        if(tempArray.length < 4){
          flag = false;
        }
      }
    }

    this.getMessage(test);
    return flag;
  }

  getMessage(test: string[]){
    this.message1 = "";
    this.message2 = "";
    let words = "";
    let categories = "";
    let allWords = this.categoryService.getAllUserPhrases;
    for(let i=0;i<test.length ;i++){
      if(allWords.some((word)=> { return word.name === test[i]}) === false)
      {
        words += `${test[i]},`;
      }
      else{
        let wordTemp = allWords.find((word)=> {return word.name === test[i]});
        let tempArray = allWords.filter(word => word.categoryID === wordTemp.categoryID);
        if(tempArray.length < 4){
          categories += `${test[i]},`;
        }
      }
    }

    if(words.length>0){
      words = words.substring(0, words.length - 1);
      this.message1 += `המילים הבאות אינן קיימות יותר במערכת: ${words}`;
    }

    if(categories.length>0){
      categories = categories.substring(0, categories.length - 1);
      this.message2 += `בקטגוריות אליהן המילים הבאות משוייכות אין מספיק מילים: ${categories}`;
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

  wasPlayed(test: TestInfo){
    return this.testService.testResult.filter(a => a.testId === test.id).length > 0;
  }

  isWrong(test: TestInfo, word:string){
    if(this.wasPlayed(test) === false)
    {
      return false;
    }

    let testResult = this.testService.testResult.find(a => a.testId === test.id);
    return testResult?.wrongList.some(a=> a === word);
  }

  isRight(test: TestInfo, word:string){
    if(this.wasPlayed(test) === false)
    {
      return false;
    }

    let testResult = this.testService.testResult.find(a => a.testId === test.id);
    return testResult?.rightList.some(a=> a === word);
  }

  getTestDuration(testId: string){
    let minutes = "";
    this.testService.testResult.sort((b, a) => new Date(b.answerDate).getTime() - new Date(a.answerDate).getTime());
    let testResult = this.testService.testResult.find((test) => test.testId === testId);

    if(testResult !== undefined)
    {
      minutes = testResult.duration.toPrecision(2);
    }
    return minutes;
  }

  getTestGrade(testId: string){
    let grade = 0;
    this.testService.testResult.sort((b, a) => new Date(b.answerDate).getTime() - new Date(a.answerDate).getTime());
    let testResult = this.testService.testResult.find((test) => test.testId === testId);
    if(testResult !== undefined)
    {
      grade = testResult.rightList.length;
    }
    return grade;
  }

  toDate(date: Date){ 
    let dateNew = new Date(date).toLocaleDateString();
    return dateNew;
  }
}
