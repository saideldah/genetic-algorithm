import { ColorBoardComponent } from './color-board/color-board.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShortestPathComponent } from './shortest-path/shortest-path.component';
import { TimeTableComponent } from './time-table/time-table.component';


const routes: Routes = [
  {
    path: 'TimeTable',
    component: TimeTableComponent
  }
  ,{
    path: 'ShortestPath',
    component: ShortestPathComponent
  }
  , {
    path: 'ColorBoard',
    component: ColorBoardComponent
  }
  , {
    path: '',
    redirectTo: '/TimeTable',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
