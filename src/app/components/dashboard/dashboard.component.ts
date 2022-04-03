import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppInitService } from 'src/app/shared/services/app-init.service';
import { CategoryInfraService } from 'src/app/shared/services/category-infra.service';
import { WordInfraService } from 'src/app/shared/services/word-infra.service';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public appBuilderProvider: AppInitService | undefined

  constructor(public authService: AuthService,public categoryInfra: CategoryInfraService,
    public wordInfra: WordInfraService,public router: Router,) {
      this.appBuilderProvider = new AppInitService(this.categoryInfra, this.wordInfra, this.authService);

    }
  ngOnInit(): void {}
  public showCategories(){
  //this.appBuilderProvider?.fillDB();
  this.router.navigate(['category-page']);

  }
}