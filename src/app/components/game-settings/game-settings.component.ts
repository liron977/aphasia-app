import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameInfo } from 'src/app/shared/models/game-info.model';
import { GameSettings } from 'src/app/shared/models/game-settings.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryInfraService } from 'src/app/shared/services/category-infra.service';
import { ErrorInfra } from 'src/app/shared/services/error-infra.service';
import { GameInfraService } from 'src/app/shared/services/game-infra.service';
import { ConfirmationDialogComponent } from '../utils/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrls: ['./game-settings.component.scss']
})

export class GameSettingsComponent implements OnInit {
  gameSetting: GameSettings;
  gamesInformation: GameInfo[];

  constructor(
    public authService: AuthService,
    public categoryService: CategoryInfraService,
    public gameService:GameInfraService,
    public router: Router,
    public dialog: MatDialog,
    public messageInfra: ErrorInfra) { }

  ngOnInit(): void {
    this.gameSetting = this.gameService.gameSettings[0];
    this.gamesInformation = this.gameSetting.listOfGames;
    if(this.gamesInformation.length === 0){
      this.messageInfra.openSimleSnackBar('שים לב: כעת אין משחקים מותאמים אישית למטופל', 'סגור');
    }
  }

  deleteGameInfo(game:GameInfo){

    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{ data: {name: "למחוק"}});
    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        this.gameService.deleteGameInfo(game);
        this.gameSetting = this.gameService.gameSettings[0];
        this.gamesInformation = this.gameSetting.listOfGames;
      }
    });

  }

  navigateToCreateGame(){
    if(this.gamesInformation.length === 3)
    {
      this.messageInfra.openSimleSnackBar('כעת יש במערכת 3 משחקים מותאמים אישית למטופל עלייך למחוק אחד כדי לייצר אחד חדש', 'סגור');
    }
    else{
      this.router.navigate(['create-game-page']);
    }
  }

  changeRandomGameSetting(){
    this.gameService.changeRandomGame(this.gameSetting);
  }

}
