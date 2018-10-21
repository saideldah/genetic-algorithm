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
  drawRoad(cityA: City, cityB: City): void {
      this.context.moveTo(cityA.x, cityA.y);
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
  getDistance(cityA: City, cityB: City): number {
      // Distance = sqrt( (x2-x1)^2 + (y2-y1)^2 )
      return Math.round(Math.sqrt(Math.pow((cityB.x - cityA.x), 2) + Math.pow((cityB.y - cityA.y), 2)));
  }
  getPathDistance(path: City[]): number {
      let distance = 0;
      for (let index = 1; index < path.length; index++) {
          const cityA = path[index - 1];
          const cityB = path[index];
          ditance += this.getDistance(cityA, cityB);
      }
      return distance;
  }
  clear() {
      this.context.clearRect(0, 0, this.width, this.height);
      this.drawCities(this.citiesMap);
  }

  getRandomNumber(maxNumber) {
      let randomNumber = Math.floor((Math.random() * maxNumber));
      return randomNumber;
  }
  //#region set up population
  /**
   * generate path
   * @param cityMaps
   */
  generateChromosome(citiesMaps: City[]): City[] {
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
  }
  /**
   * generate new Popluation
   * @param cityMaps
   */
  generatePopulation(citiesMaps: City[]): City[][] {
      const population: City[][] = [];
      for (let index = 0; index < this.populationSize; index++) {
          population.push(this.generateChromosome(citiesMaps));
      }
      return population;
  }
  //#endregion

  //#region Evaluation
  /**
   *
   * @param Chromosome
   */
  getChromosomeScore(Chromosome: City[]): number {
      return 1 / this.getPathDistance(Chromosome);
  }
  /**
   *
   * @param population
   */
  getFittestChromosome(population: City[][]): City[] {
      let fittestIndex = 0;
      let fittest = 0;
      for (let i = 0; i < population.length; i++) {
          const ChromosomeFitness = this.getChromosomeScore(population[i]);
          if (fittest === 0) {
              fittest = ChromosomeFitness;
              fittestIndex = i;
          } else if (ChromosomeFitness < fittest) {
              fittest = ChromosomeFitness;
              fittestIndex = i;
          }
      }
      return population[fittestIndex];
  }
  //#endregion

  //#region selection
  selectBestN(population: City[][], selectionNumber: number, errorThreshold: number): City[][] {
      let fittestChromosome = this.getFittestChromosome(population);
      let fittest = this.getChromosomeScore(fittestChromosome);
      let bestN: City[][] = [];
      let count = 0;
      while (count < selectionNumber) {
          population.forEach((Chromosome) => {
              let ChromosomeScore = this.getChromosomeScore(Chromosome);
              if (ChromosomeScore >= fittest - errorThreshold && ChromosomeScore <= fittest + errorThreshold) {
                  if (count < selectionNumber) {
                      bestN.push(Chromosome);
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
  doCrossOver(fittestChromosomes: City[][]): City[][] {
      let newPopulation: City[][] = [];
      for (let i = 0; i < fittestChromosomes.length; i += 2) {
          let childrens = [];
          if (fittestChromosomes[i + 2]) {
              childrens = this.makeChildren(fittestChromosomes[i], fittestChromosomes[i + 1], true);
          } else {
              childrens = this.makeChildren(fittestChromosomes[i], fittestChromosomes[i - 1]);
          }
          newPopulation = newPopulation.concat(childrens);
          if ((newPopulation.length + fittestChromosomes.length) >= this.populationSize) {
              break;
          }
      }
      return newPopulation.concat(fittestChromosomes);
  }

  // need enhancement
  makeChildren(ChromosomeXY: City[], ChromosomeXX: City[], makeTwo = false): City[][] {
      let childrens = this.mateChromosomes(ChromosomeXY, ChromosomeXX);
      let selectedChildrens = [];
      let firstIndex = this.getRandomNumber(this.citiesMap.length - 1);
      selectedChildrens.push(childrens[firstIndex]);
      if (makeTwo) {
          let secondIndex = 0;
          do {
              secondIndex = this.getRandomNumber(this.citiesMap.length - 1);
          } while (firstIndex == secondIndex);
          selectedChildrens.push(childrens[secondIndex]);
      }
      return childrens;
  }
  mateChromosomes(ChromosomeXY: City[], ChromosomeXX: City[]): City[][] {
      let parentChromosomeMidIndex = ChromosomeXY.length / 2;
      let lastIndex = ChromosomeXY.length - 1;
      let ChromosomeXYFirstHalf = ChromosomeXY.slice(0, parentChromosomeMidIndex);
      let ChromosomeXYSecondHalf = ChromosomeXY.slice(parentChromosomeMidIndex, lastIndex);
      let ChromosomeXXFirstHalf = ChromosomeXX.slice(0, parentChromosomeMidIndex);
      let ChromosomeXXSecondHalf = ChromosomeXX.slice(parentChromosomeMidIndex, lastIndex);
      let childrens = [];
      childrens.push(this.completeHalfChromosomeFromChromosome(ChromosomeXYFirstHalf, ChromosomeXX));
      childrens.push(this.completeHalfChromosomeFromChromosome(ChromosomeXYSecondHalf, ChromosomeXX));
      childrens.push(this.completeHalfChromosomeFromChromosome(ChromosomeXXFirstHalf, ChromosomeXY));
      childrens.push(this.completeHalfChromosomeFromChromosome(ChromosomeXXSecondHalf, ChromosomeXY));
      return childrens;
  }
  completeHalfChromosomeFromChromosome(halfChromosome: City[], Chromosome: City[]): City[] {
      let newChromosome = [];
      newChromosome = newChromosome.concat(halfChromosome);
      Chromosome.forEach((gene) => {
          let index = newChromosome.findIndex(c => c.name == gene.name);
          if (newChromosome.length < Chromosome.length && index < 0) {
              newChromosome.push(gene);
          }
      });
      return newChromosome;
  }
  //#endregion

  //#region mutation
  doMutation(Chromosome: City[]): City[] {
      //mutation will be on top two cities
      let longestRoadCityAIndex = 0;
      let longestRoadCityBIndex = 0;
      let longestRoad = 0;

      let secondLongestRoadCityAIndex = 0;
      let secondLongestRoadCityBIndex = 0;
      let secondLongestRoad = 0;


      for (let i = 0; i < Chromosome.length; i++) {
          if (i < Chromosome.length - 1) {
              let roadDistance = this.getDistance(Chromosome[i], Chromosome[i + 1]);
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
      let temp = Chromosome[longestRoadCityAIndex];
      Chromosome[longestRoadCityAIndex] = Chromosome[secondLongestRoadCityAIndex];
      Chromosome[secondLongestRoadCityAIndex] = temp;

      return Chromosome;
  }
  doMutationNew(Chromosome: City[], pM: number): City[] {
      const mutatedRoute = Chromosome.slice();
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
       * b- stop when the most fit solution has not changed in a certain number of generations
       */
      this.stop = false;
      let citiesMap: City[] = this.citiesMap.slice();
      let generationCount = 0;
      let population = this.generatePopulation(citiesMap);
      let fittestChromosome = this.getFittestChromosome(population);
      let bestChromosome: City[] = fittestChromosome;
      let bestChromosomeScore: number = 0;
      while (this.getChromosomeScore(fittestChromosome) < 1 && !this.stop) {
          generationCount++;
          let nextGeneration = this.selectBestN(population, population.length / 2, 10);
          nextGeneration = this.doCrossOver(nextGeneration);

          for (let i = 0; i < nextGeneration.length; i++) {
              nextGeneration[i] = this.doMutationNew(nextGeneration[i], 5);
          }
          population = nextGeneration;
          fittestChromosome = this.getFittestChromosome(population);
          let fittestChromosomeScore = this.getChromosomeScore(fittestChromosome);
          if (bestChromosomeScore < fittestChromosomeScore) {
              bestChromosome = fittestChromosome;
              bestChromosomeScore = fittestChromosomeScore;
          }
          let ChromosomeString = fittestChromosome.map(x => x.name).join();
          let bestChromosomeString = bestChromosome.map(x => x.name).join();
          console.log(`---------------------------------------------------------`);
          console.log(`Generation:${generationCount},Best Solution: ${bestChromosomeString}, Best Score: ${bestChromosomeScore},  Solution: [${ChromosomeString}], Score: ${fittestChromosomeScore}`);
          console.log(`---------------------------------------------------------`);
        //   setTimeout(() => {    //<<<---    using ()=> syntax
        //   }, 50);
      }
      fittestChromosome;
  }

}


class City {
  name: string;
  x: number;
  y: number;
}
