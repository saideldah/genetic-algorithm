import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ShortestPathComponent } from './shortest-path/shortest-path.component';
import { AppRoutingModule } from './app-routing.module';
import { ColorBoardComponent } from './color-board/color-board.component';
import { TimeTableComponent } from './time-table/time-table.component';

@NgModule({
  declarations: [
    AppComponent,
    ShortestPathComponent,
    ColorBoardComponent,
    TimeTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
