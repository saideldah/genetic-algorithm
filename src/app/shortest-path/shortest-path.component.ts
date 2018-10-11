import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { sendRequest } from 'selenium-webdriver/http';

@Component({
  selector: 'app-shortest-path',
  templateUrl: './shortest-path.component.html',
  styleUrls: ['./shortest-path.component.css']
})
export class ShortestPathComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  width: number;
  height: number;
  citiesMap: City[];
  path: string[];
  pathDistance: number;
  populationSize = 100;
  stop = true;
  constructor() {
      this.width = 400;
      this.height = 400;
  }
  ngOnInit(): void {
      this.path = [];
      this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
      this.context.font = '16px Arial';
      this.citiesMap = [
          {
              name: 'A',
              x: 10,
              y: 200
          }
          , {
              name: 'B',
              x: 100,
              y: 100
          }
          , {
              name: 'C',
              x: 100,
              y: 300
          }
          , {
              name: 'D',
              x: 300,
              y: 100
          }
          , {
              name: 'E',
              x: 200,
              y: 250
          }
          , {
              name: 'F',
              x: 380,
              y: 200
          }
          , {
              name: 'G',
              x: 150,
              y: 180
          }
          , {
              name: 'H',
              x: 300,
              y: 150
          }
          , {
              name: 'I',
              x: 240,
              y: 320
          }
          , {
              name: 'J',
              x: 180,
              y: 390
          }
      ];

      this.drawCities(this.citiesMap);
      this.drawPath(this.citiesMap);
      this.pathDistance = this.getPathDistance(this.citiesMap);
      this.path = this.citiesMap.map(c => c.name);
  }
  drawCities(cities: City[]): void {
      cities.forEach((city) => {
          this.context.strokeText(city.name, city.x, city.y);
      });
  }
  drawRoad(cirtyA: City, cityB: City): void {
      this.context.moveTo(cirtyA.x, cirtyA.y);
      this.context.lineTo(cityB.x, cityB.y);
      this.context.stroke();
  }
  drawPath(path: City[]): void {
      for (let index = 1; index < path.length; index++) {
          const cityA = path[index - 1];
          const cityB = path[index];
          this.drawRoad(cityA, cityB);
      }
  }
  getDistance(cirtyA: City, cityB: City): number {
      // Distance = sqrt( (x2-x1)^2 + (y2-y1)^2 )
      return Math.round(Math.sqrt(Math.pow((cityB.x - cirtyA.x), 2) + Math.pow((cityB.y - cirtyA.y), 2)));
  }
  getPathDistance(path: City[]): number {
      let ditance = 0;
      for (let index = 1; index < path.length; index++) {
          const cityA = path[index - 1];
          const cityB = path[index];
          ditance += this.getDistance(cityA, cityB);
      }
      return ditance;
  }
  clear() {
      this.context.clearRect(0, 0, this.width, this.height);
      this.drawCities(this.citiesMap);
  }
  getRandomNumber(maxNumber) {
      let index = Math.floor((Math.random() * maxNumber));
      return index;
  }
  //#region set up population
  /**
   * generate path
   * @param cityMaps
   */
  generateGenome(citiesMaps: City[]): City[] {
      var currentIndex = citiesMaps.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = citiesMaps[currentIndex];
          citiesMaps[currentIndex] = citiesMaps[randomIndex];
          citiesMaps[randomIndex] = temporaryValue;
      }

      return citiesMaps;

      // const genome = [];
      // let index = 0;
      // for (let i = 0; i < citiesMaps.length; i++) {
      //     do {
      //         index = this.getRandomNumber(citiesMaps.length - 1);
      //     } while (genome.findIndex(x => x.name === citiesMaps[index].name) >= 0);
      //     genome.push(citiesMaps[index]);
      // }
      // return genome;
  }
  /**
   * generate new Popluation
   * @param cityMaps
   */
  generatePopulation(citiesMaps: City[]): City[][] {
      const population: City[][] = [];
      for (let index = 0; index < this.populationSize; index++) {
          population.push(this.generateGenome(citiesMaps));
      }
      return population;
  }
  //#endregion

  //#region Evaluation
  /**
   *
   * @param genome
   */
  getGenomeScore(genome: City[]): number {
      return 1 / this.getPathDistance(genome);
  }
  /**
   *
   * @param population
   */
  getFittestGenome(population: City[][]): City[] {
      let fittestIndex = 0;
      let fittest = 0;
      for (let i = 0; i < population.length; i++) {
          const genomeFitness = this.getGenomeScore(population[i]);
          if (fittest === 0) {
              fittest = genomeFitness;
              fittestIndex = i;
          } else if (genomeFitness < fittest) {
              fittest = genomeFitness;
              fittestIndex = i;
          }
      }
      return population[fittestIndex];
  }
  //#endregion

  //#region selection
  selectBestN(population: City[][], selectionNumber: number, errorThreshold: number): City[][] {
      let fittestGenome = this.getFittestGenome(population);
      let fittest = this.getGenomeScore(fittestGenome);
      let bestN: City[][] = [];
      let count = 0;
      while (count < selectionNumber) {
          population.forEach((genome) => {
              let genomeScore = this.getGenomeScore(genome);
              if (genomeScore >= fittest - errorThreshold && genomeScore <= fittest + errorThreshold) {
                  if (count < selectionNumber) {
                      bestN.push(genome);
                      count++;
                  }
              }
          });
          fittest--;
      }
      return bestN;
  }
  //#endregion

  //#region crossover
  doCrossOver(fittestGenoms: City[][]): City[][] {
      let newPopulation: City[][] = [];
      for (let i = 0; i < fittestGenoms.length; i += 2) {
          let childrens = [];
          if (fittestGenoms[i + 2]) {
              childrens = this.makeChildren(fittestGenoms[i], fittestGenoms[i + 1], true);
          } else {
              childrens = this.makeChildren(fittestGenoms[i], fittestGenoms[i - 1]);
          }
          newPopulation = newPopulation.concat(childrens);
          if ((newPopulation.length + fittestGenoms.length) >= this.populationSize) {
              break;
          }
      }
      return newPopulation.concat(fittestGenoms);
  }

  // need inhancment
  makeChildren(genomeXY: City[], genomeXX: City[], makeTwo = false): City[][] {
      let childrens = this.mateGenomes(genomeXY, genomeXX);
      let selectedChildrens = [];
      let firstIndex = this.getRandomNumber(this.citiesMap.length - 1);
      selectedChildrens.push(childrens[firstIndex]);
      if (makeTwo) {
          let seconIndex = 0;
          do {
              seconIndex = this.getRandomNumber(this.citiesMap.length - 1);
          } while (firstIndex == seconIndex);
          selectedChildrens.push(childrens[seconIndex]);
      }
      return childrens;
  }
  mateGenomes(genomeXY: City[], genomeXX: City[]): City[][] {
      let parentGenomeMidIndex = genomeXY.length / 2;
      let lastIndex = genomeXY.length - 1;
      let genomeXYFirstHalf = genomeXY.slice(0, parentGenomeMidIndex);
      let genomeXYSecondHalf = genomeXY.slice(parentGenomeMidIndex, lastIndex);
      let genomeXXFirstHalf = genomeXX.slice(0, parentGenomeMidIndex);
      let genomeXXSecondHalf = genomeXX.slice(parentGenomeMidIndex, lastIndex);
      let childrens = [];
      childrens.push(this.completeHalfGenomeFromGenome(genomeXYFirstHalf, genomeXX));
      childrens.push(this.completeHalfGenomeFromGenome(genomeXYSecondHalf, genomeXX));
      childrens.push(this.completeHalfGenomeFromGenome(genomeXXFirstHalf, genomeXY));
      childrens.push(this.completeHalfGenomeFromGenome(genomeXXSecondHalf, genomeXY));
      return childrens;
  }
  completeHalfGenomeFromGenome(halfGenome: City[], genome: City[]): City[] {
      let newGenome = [];
      newGenome = newGenome.concat(halfGenome);
      genome.forEach((gene) => {
          let index = newGenome.findIndex(c => c.name == gene.name);
          if (newGenome.length < genome.length && index < 0) {
              newGenome.push(gene);
          }
      });
      return newGenome;
  }
  //#endregion

  //#region mutation
  doMutation(genome: City[]): City[] {
      //mutation will be on top two cities
      let longestRoadCityAIndex = 0;
      let longestRoadCityBIndex = 0;
      let longestRoad = 0;

      let secondLongestRoadCityAIndex = 0;
      let secondLongestRoadCityBIndex = 0;
      let secondLongestRoad = 0;


      for (let i = 0; i < genome.length; i++) {
          if (i < genome.length - 1) {
              let roadDistance = this.getDistance(genome[i], genome[i + 1]);
              if (roadDistance > longestRoad) {
                  secondLongestRoad = longestRoad;
                  secondLongestRoadCityAIndex = longestRoadCityAIndex;
                  secondLongestRoadCityBIndex = longestRoadCityBIndex;
                  longestRoad = roadDistance;
                  longestRoadCityAIndex = i;
                  longestRoadCityBIndex = i + 1;
              }
          }
      }
      //swap
      let temp = genome[longestRoadCityAIndex];
      genome[longestRoadCityAIndex] = genome[secondLongestRoadCityAIndex];
      genome[secondLongestRoadCityAIndex] = temp;

      return genome;
  }
  doMutationNew(genome: City[], pM: number): City[] {
      const mutatedRoute = genome.slice();
      for (let index in mutatedRoute) {
          if (pM > Math.random()) {
              const randInd = Math.floor(Math.random() * mutatedRoute.length);
              const tempLoc = mutatedRoute[randInd];
              mutatedRoute[randInd] = mutatedRoute[index];
              mutatedRoute[index] = tempLoc;
          }
      }
      return mutatedRoute;
  };
  //#endregion
  stopEvolving() {
      this.stop = true;
  }
  evolve() {
      /**
       * 1- generate population
       * 2- Evaluation
       * 3- Selection
       * 4- Crossover
       * 5- Mutation
       * 6- new generation
       * 7- go to step 2
       * When To Stop:
       * a- after set number of generation
       * b- stop when the most fit solution has not changed i a certain number of generations
       */
      this.stop = false;
      let citiesMap: City[] = this.citiesMap.slice();
      let generationCount = 0;
      let population = this.generatePopulation(citiesMap);
      let fittestGenome = this.getFittestGenome(population);
      let bestGenome: City[] = fittestGenome;
      let bestGenomeScore: number = 0;
      while (this.getGenomeScore(fittestGenome) < 1 && !this.stop) {
          generationCount++;
          let nextGeneration = this.selectBestN(population, population.length / 2, 10);
          nextGeneration = this.doCrossOver(nextGeneration);

          for (let i = 0; i < nextGeneration.length; i++) {
              nextGeneration[i] = this.doMutationNew(nextGeneration[i], 5);
          }
          population = nextGeneration;
          fittestGenome = this.getFittestGenome(population);
          let fittestGenomeScore = this.getGenomeScore(fittestGenome);
          if (bestGenomeScore < fittestGenomeScore) {
              bestGenome = fittestGenome;
              bestGenomeScore = fittestGenomeScore;
          }
          let genomeString = fittestGenome.map(x => x.name).join();
          let bestGenomeString = bestGenome.map(x => x.name).join();
          console.log(`---------------------------------------------------------`);
          console.log(`Generation:${generationCount},Best Solution: ${bestGenomeString}, Best Score: ${bestGenomeScore},  Solution: [${genomeString}], Score: ${fittestGenomeScore}`);
          console.log(`---------------------------------------------------------`);
          setTimeout(() => {    //<<<---    using ()=> syntax
          }, 50);

      }
      fittestGenome;
  }

}


class City {
  name: string;
  x: number;
  y: number;
}
