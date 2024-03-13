import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'vex-rsvpreader',
  standalone: true,
  templateUrl: './rsvpreader.component.html',
  styleUrls: ['./rsvpreader.component.scss'],
  imports: [MatIconModule,CommonModule, FormsModule, MatTooltipModule, MatButtonModule ]
})
export class RsvpreaderComponent {
  text = 'Red, Blue,Yellow,Green,Black,White,Gray,Orange,,Purple,Pink,Brown,Cyan,Magenta, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sundayone, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twenty-one, twenty-two, twenty-three, twenty-four, twenty-five, twenty-six, twenty-seven, twenty-eight, twenty-nine, thirty, one hundred, two hundred, three hundred, four hundred, five hundred, six hundred, seven hundred, eight hundred, nine hundred, one thousand,January, February, March, April, May, June, July, August, September, October, November, December, Sofa, Table, Chair, Bed, Lamp, Desk, Dresser, Bookshelf, Coffee Table, Nightstand, Mirror, Rug, Television, Clock, Pillow, Blanket, Fridge, Oven, Microwave, Toaster, Blender, Washing Machine, Dryer, Dishwasher, Vacuum Cleaner, Iron, Fan, Heater, Curtains, Trash Can,                    Passport, Ticket, Suitcase, Backpack, Map, Hotel, Flight, Airport, Destination, Itinerary, Tourist, Guidebook, Reservation, Currency, Visa, Sunglasses, Camera, Beach, Mountain, City, Country, Adventure, Explore, Souvenir, Transportation, Schedule, Landmark, Culture, Cuisine, Traveler,Mom, Dad, Yes, No, Please, Thank you, Sorry, Hello, Goodbye, Friend, Play, Toy, Game, Ball, Dog, Cat, School, Book, Read, Write, Color, Draw, Paint, Sing, Dance, Jump, Run, Candy, Cookie, Cake, Juice, Milk, Water, Bed, Sleep, Bath, Brush,,Happy, Sad, Scared, Love, Hug, Kiss, Birthday, Party, Park, Bike, Slide, Swing, Swim, Fish, Bear, Doll, Car, Truck, Bus, Plane, Train, Sun, Moon, Star, Sky, Cloud, Rain, Snow, Tree, Flower, Grass, Rock, Sand, Sea, River, Mountain, Forest, Animal, Bird, Chicken, Duck, Horse, Cow, Pig,,Sheep, Elephant, Lion, Tiger, Monkey, Zoo, Playground, Slide, Swing, Climber, Ball, Bat, Soccer, Football, Basketball, Baseball, Tennis, Golf, Ice cream, Chocolate, Pizza, Burger, Sandwich, Salad, Fruit, Apple, Banana, Orange, Strawberry, Cherry, Grape, Lemon, Melon, Peach, Pear,Pineapple, Tomato, Vegetable, Carrot, Potato, Onion, Lettuce, Cucumber, Peas, Corn, Bean, Rice, Pasta, Bread, Cheese, Egg, Meat, Chicken, Fish, Juice, Water, Milk, Tea, Coffee, Soda, Story, Book, Movie';
  words: string[] = [];
  currentWord = '';
  currentWordFormatted: SafeHtml | undefined;
  currentIndex = 0;
  readingInterval: any;
  intervalSpeed = 200;

  constructor(private sanitizer: DomSanitizer) {
    this.words = this.text.split(',').map(word => word.trim());
  }

  startReading() {
    if (this.readingInterval) {
      return;
    }

    this.readingInterval = setInterval(() => {
      if (this.currentIndex < this.words.length) {
        const word = this.words[this.currentIndex++];
        this.currentWord = word;
        this.currentWordFormatted = this.formatWord(word);
      } else {
        this.stopReading();
      }
    }, this.intervalSpeed);
  }

  stopReading() {
    clearInterval(this.readingInterval);
    this.readingInterval = null;
    this.currentIndex = 0;
  }

  adjustSpeed(speed: number) {
    this.intervalSpeed = speed;
    if (this.readingInterval) {
      this.stopReading();
      this.startReading();
    }
  }

  formatWord(word: string): SafeHtml {
    if (word.length > 1) {
      const middleIndex = Math.floor(word.length / 2);
      const formattedWord = `${word.substring(0, middleIndex)}<span class="highlight">${word[middleIndex]}</span>${word.substring(middleIndex + 1)}`;
      return this.sanitizer.bypassSecurityTrustHtml(formattedWord);
    }
    return word;
  }

}
