import { ColorBoardComponent } from './color-board/color-board.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShortestPathComponent } from './shortest-path/shortest-path.component';


const routes: Routes = [
  {
    path: 'ShortestPath',
    component: ShortestPathComponent
  }
  , {
    path: 'ColorBoard',
    component: ColorBoardComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
