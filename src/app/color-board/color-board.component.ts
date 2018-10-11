import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-board',
  templateUrl: './color-board.component.html',
  styleUrls: ['./color-board.component.css']
})
export class ColorBoardComponent implements OnInit {
  colorTable: string[][] = [];
  colorSet: string[] = [];
  populationSize = 300;
  population: any[] = [];
  constructor() {

  }

  ngOnInit() {
    this.colorSet = [
      'red'
      , 'green'
      , 'blue'
      , 'purple'
      , 'yellow'
      , 'saddlebrown'
    ];
    for (let index = 0; index < this.populationSize; index++) {
      setTimeout(() => {    //<<<---    using ()=> syntax
        this.colorTable = this.generateColorTable();
        this.population.push(this.colorTable);
      }, 1000);
    }
  }
  cloneObject(object: any): any {
    const jsonString = JSON.stringify(object);
    const clonedObject = JSON.parse(jsonString);
    return clonedObject;
  }
  getRandomRow(colorRow) {
    colorRow = this.cloneObject(colorRow)
    var currentIndex = this.colorSet.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = colorRow[currentIndex];
      colorRow[currentIndex] = colorRow[randomIndex];
      colorRow[randomIndex] = temporaryValue;
    }
    debugger;
    return colorRow;
  }
  generateColorTable(){
    let colorTable = [];
    for (let index = 0; index < 6; index++) {
      let row = this.getRandomRow(this.colorSet);
      colorTable.push(row);
    }
    return colorTable;
  }
}
