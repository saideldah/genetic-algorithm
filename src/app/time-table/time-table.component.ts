import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-table',
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.css']
})
export class TimeTableComponent implements OnInit {

  //algorithm input
  populationSize: number = 50;
  mutiationRatio: number;
  //problem input
  numberOfInstructors: number = 5
  instructors: Instructor[];

  nuberOfClasses: number = 5;
  numberOfDays: number = 5;
  numberOfSessions: number = 6;


  constructor() {
    this.instructors = [];
  }
  ngOnInit() {
  }
  generatePopulation(): Chromosome[] {
    return [];
  }
  getChromosomeScore(population: Chromosome): number {
    return 0;
  }
  getFittestChromosome(population: Chromosome[]): Chromosome {
    return new Chromosome();
  }
  selectBestN(population: Chromosome[], numberOfSelection: number): Chromosome[] {
    return [];
  }
  doCrossOver(bestN: Chromosome[]): Chromosome[] {
    return [];
  }
  doMutation(population: Chromosome): Chromosome {
    return new Chromosome();
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
    let generationCount = 0;
    let population = this.generatePopulation();
    let fittestChromosome = this.getFittestChromosome(population);
    let bestChromosomeScore: number = 0;
    while (this.getChromosomeScore(fittestChromosome) < 1) {
      generationCount++;
      let nextGeneration = this.selectBestN(population, population.length / 2);
      nextGeneration = this.doCrossOver(nextGeneration);

      for (let i = 0; i < nextGeneration.length; i++) {
        nextGeneration[i] = this.doMutation(nextGeneration[i]);
      }
      population = nextGeneration;
      fittestChromosome = this.getFittestChromosome(population);
      let fittestChromosomeScore = this.getChromosomeScore(fittestChromosome);
      if (bestChromosomeScore < fittestChromosomeScore) {
        fittestChromosome = fittestChromosome;
        bestChromosomeScore = fittestChromosomeScore;
      }
    }
    return fittestChromosome;
  }
}
class Instructor {
  name: string;
  numberOfSesions: number;
  nubmerConsumedSesions: number;
}
// is the schedule
class Gene {
  schedule: Instructor[][];
}
class Chromosome {
  genes: Gene[];
}
