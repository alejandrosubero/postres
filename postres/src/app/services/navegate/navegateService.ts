import { Injectable } from '@angular/core';
import { Data } from '../../models/navegation/data.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavegateService {


  constructor(
      private router: Router,
  ) { }


 goFavorites(routeName: string, id: number): void {
    const pestData: Data = {
      id: id,
      name: routeName
    };
    this.router.navigate(['app/favorites', id], {
      state: { data: pestData }
    });
  }
  

   goToDetail(detailRouteName: string, id: number, namePest: string): void {
    const pestData: Data = {
      id: id,
      name:namePest
    };
    this.router.navigate([`/${detailRouteName}`, id], {
      state: { data: pestData }
    });
  }


  getData(routerx: Router): Data {
    let pestData: Data = { id: 0, name: '' };
    let pestDataTemp: Data = { id: 0, name: '' }
 
    const nav = routerx.getCurrentNavigation();
    pestData = nav?.extras?.state?.['data'] || history.state.data || null;
    
    if (!pestData) {
      console.warn('No pestData passed, fetching by ID or redirecting...');
    } else {
       const id : number = pestData.id != undefined && pestData.id != null ? pestData.id : 0;
       const nameToNavegate = pestData.name != undefined && pestData.name != null ? pestData.name : '';
      pestDataTemp = { id: id , name: nameToNavegate }
    }
    return pestDataTemp;
  }


}

