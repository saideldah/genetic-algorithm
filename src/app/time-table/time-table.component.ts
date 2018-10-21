import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-table',
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.css']
})
export class TimeTableComponent implements OnInit {

  //algorithm input
  populationSize: number = 50;
  mutilationRatio: number;
  //problem input
  numberOfInstructors: number = 5
  instructors: Instructor[];

  //chromosome size
  numberOfClasses: number = 5;

  numberOfDays: number = 5;

  numberOfSessionsPerDay: number = 6;

  numberOfScheduleSessions: number;

  constructor() {
    this.numberOfScheduleSessions = this.numberOfClasses * this.numberOfDays * this.numberOfSessionsPerDay;

    this.instructors = [
      {
        name: 'A',
        numberOfSessions: 30,
        numberConsumedSessions: 0
      }
      , {
        name: 'B',
        numberOfSessions: 30,
        numberConsumedSessions: 0
      }
      , {
        name: 'C',
        numberOfSessions: 30,
        numberConsumedSessions: 0
      }
      , {
        name: 'D',
        numberOfSessions: 30,
        numberConsumedSessions: 0
      }
      , {
        name: 'E',
        numberOfSessions: 30,
        numberConsumedSessions: 0
      }
    ];

  }

  ngOnInit() {
  }

  cloneObject(object: any): any {
    const jsonString = JSON.stringify(object);
    const clonedObject = JSON.parse(jsonString);
    return clonedObject;
  }

  getRandomNumber(maxNumber) {
    let randomNumber = Math.floor((Math.random() * maxNumber));
    return randomNumber;
  }

  shuffleInstructors(instructors: Instructor[]): Instructor[] {
    let shuffledInstructors = instructors.slice();
    let currentIndex = shuffledInstructors.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = shuffledInstructors[currentIndex];
      shuffledInstructors[currentIndex] = shuffledInstructors[randomIndex];
      shuffledInstructors[randomIndex] = temporaryValue;
    }
    return shuffledInstructors;
  }

  shuffleGene(gene: Gene): Gene {
    let shuffledGene = this.cloneObject(gene);
    for (let day = 0; day < this.numberOfDays; day++) {
      shuffledGene.schedule[day] = this.shuffleInstructors(gene.schedule[day]);
    }
    return shuffledGene;
  }

  //generate schedule
  generateGene(): Gene {
    let gene = new Gene();
    // Constraint: every instructor should not exceed his numberOfSessions
    let instructors = this.instructors.slice();
    for (let day = 0; day < this.numberOfDays; day++) {
      for (let session = 0; session < this.numberOfSessionsPerDay; session++) {
        let instructor = new Instructor();
        instructors = this.shuffleInstructors(instructors);
        let randomIndex = this.getRandomNumber(6);
        while (instructors[randomIndex].numberConsumedSessions == instructors[randomIndex].numberOfSessions) {
          instructors = this.shuffleInstructors(instructors);
          randomIndex = this.getRandomNumber(6);
        }
        instructor.name = instructors[randomIndex].name;
        instructors[randomIndex].numberConsumedSessions++;
      }
    }
    return gene;
  }

  generateChromosome(): Chromosome {
    let chromosome = new Chromosome();
    chromosome.numberOfDays = this.numberOfDays;
    chromosome.numberOfSessionsPerDay = this.numberOfSessionsPerDay;
    for (let i = 0; i < this.numberOfClasses; i++) {
      chromosome.genes.push(this.generateGene());
    }
    return chromosome;
  }

  generatePopulation(): Chromosome[] {
    let population: Chromosome[] = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.generateChromosome());
    }
    return population;
  }

  getFittestChromosome(population: Chromosome[]): Chromosome {
    let fittestChromosome: Chromosome = new Chromosome();
    fittestChromosome.numberOfDays = this.numberOfDays;
    fittestChromosome.numberOfSessionsPerDay = this.numberOfSessionsPerDay;
    population.forEach(chromosome => {
      if (fittestChromosome.getScore() < chromosome.getScore()) {
        fittestChromosome = this.cloneObject(chromosome);
      }
    });
    return fittestChromosome;
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

  isValidInstructors(): boolean {
    // if number of hours for the instructor > this.numberOfDays * this.numberOfSessionsPerDay then return false
    // if number of instructors < this.numberOfClasses then return false
    // if sum of instructors session != this.numberOfScheduleSessions return false
    if (this.instructors.length < this.numberOfClasses) {
      return false;
    } else {
      let numberOfInstructorsSessions = 0;
      this.instructors.forEach(instructor => {
        if (instructor.numberOfSessions > this.numberOfDays * this.numberOfSessionsPerDay) {
          return false;
        }
        numberOfInstructorsSessions += instructor.numberOfSessions;
      });
      if (numberOfInstructorsSessions != this.numberOfScheduleSessions) {
        return false;
      }
    }
    return true;
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


    // validate input
    if (!this.isValidInstructors()) {
      // return not valid 
    }
    let generationCount = 0;
    let population = this.generatePopulation();
    let fittestChromosome = this.getFittestChromosome(population);
    let bestChromosomeScore: number = 0;
    while (fittestChromosome.getScore() < 1) {
      generationCount++;
      let newGeneration = this.selectBestN(population, population.length / 2);
      newGeneration = this.doCrossOver(newGeneration);

      for (let i = 0; i < newGeneration.length; i++) {
        newGeneration[i] = this.doMutation(newGeneration[i]);
      }
      population = newGeneration;
      fittestChromosome = this.getFittestChromosome(population);
      let fittestChromosomeScore = fittestChromosome.getScore();
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
  numberOfSessions: number;
  numberConsumedSessions: number;
}
// is the schedule
class Gene {
  schedule: Instructor[][];
  constructor() {
    this.schedule = [];
  }
}
class Chromosome {
  numberOfDays: number;
  numberOfSessionsPerDay: number;
  genes: Gene[];
  constructor() {
    this.genes = [];
  }
  private getConflicts(geneA: Gene, geneB: Gene): number {
    let conflicts = 0;
    for (let day = 0; day < this.numberOfDays; day++) {
      for (let session = 0; session < this.numberOfSessionsPerDay; session++) {
        if (geneA.schedule[day][session].name == geneB.schedule[day][session].name) {
          conflicts++;
        }
      }
    }
    return conflicts;
  }
  getScore(): number {
    if (this.genes.length == 0) {
      return 0;
    }
    let conflicts = 0;
    for (let i = 0; i < this.genes.length - 1; i++) {
      //schedule
      let geneToCompareA = this.genes[i];
      for (let j = i + 1; j < this.genes.length; j++) {
        let geneToCompareB = this.genes[j];
        conflicts += this.getConflicts(geneToCompareA, geneToCompareB);
      }
    }
    return conflicts == 0 ? 1 : 1 / conflicts;
  }
}
