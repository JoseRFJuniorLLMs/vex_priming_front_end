import { Component } from '@angular/core';

@Component({
  selector: 'vex-rsvpreader',
  standalone: true,
  imports: [],
  templateUrl: './rsvpreader.component.html',
  styleUrl: './rsvpreader.component.scss'
})
export class RsvpreaderComponent {
  text = 'Red, Blue,Yellow,Green,Black,White,Gray,Orange,,Purple,Pink,Brown,Cyan,Magenta, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sundayone, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twenty-one, twenty-two, twenty-three, twenty-four, twenty-five, twenty-six, twenty-seven, twenty-eight, twenty-nine, thirty, one hundred, two hundred, three hundred, four hundred, five hundred, six hundred, seven hundred, eight hundred, nine hundred, one thousand,January, February, March, April, May, June, July, August, September, October, November, December, Sofa, Table, Chair, Bed, Lamp, Desk, Dresser, Bookshelf, Coffee Table, Nightstand, Mirror, Rug, Television, Clock, Pillow, Blanket, Fridge, Oven, Microwave, Toaster, Blender, Washing Machine, Dryer, Dishwasher, Vacuum Cleaner, Iron, Fan, Heater, Curtains, Trash Can,                    Passport, Ticket, Suitcase, Backpack, Map, Hotel, Flight, Airport, Destination, Itinerary, Tourist, Guidebook, Reservation, Currency, Visa, Sunglasses, Camera, Beach, Mountain, City, Country, Adventure, Explore, Souvenir, Transportation, Schedule, Landmark, Culture, Cuisine, Traveler,Mom, Dad, Yes, No, Please, Thank you, Sorry, Hello, Goodbye, Friend, Play, Toy, Game, Ball, Dog, Cat, School, Book, Read, Write, Color, Draw, Paint, Sing, Dance, Jump, Run, Candy, Cookie, Cake, Juice, Milk, Water, Bed, Sleep, Bath, Brush,,Happy, Sad, Scared, Love, Hug, Kiss, Birthday, Party, Park, Bike, Slide, Swing, Swim, Fish, Bear, Doll, Car, Truck, Bus, Plane, Train, Sun, Moon, Star, Sky, Cloud, Rain, Snow, Tree, Flower, Grass, Rock, Sand, Sea, River, Mountain, Forest, Animal, Bird, Chicken, Duck, Horse, Cow, Pig,,Sheep, Elephant, Lion, Tiger, Monkey, Zoo, Playground, Slide, Swing, Climber, Ball, Bat, Soccer, Football, Basketball, Baseball, Tennis, Golf, Ice cream, Chocolate, Pizza, Burger, Sandwich, Salad, Fruit, Apple, Banana, Orange, Strawberry, Cherry, Grape, Lemon, Melon, Peach, Pear,Pineapple, Tomato, Vegetable, Carrot, Potato, Onion, Lettuce, Cucumber, Peas, Corn, Bean, Rice, Pasta, Bread, Cheese, Egg, Meat, Chicken, Fish, Juice, Water, Milk, Tea, Coffee, Soda, Story, Book, Movie';
  words: string[] = [];
  currentWord = '';
  currentIndex = 0;
  readingInterval: any;

  constructor() {
    this.words = this.text.split(' ');
  }

  startReading() {
    if (this.readingInterval) {
      return;
    }

    this.readingInterval = setInterval(() => {
      if (this.currentIndex < this.words.length) {
        this.currentWord = this.words[this.currentIndex++];
      } else {
        this.stopReading();
      }
    }, 200); // Ajuste o intervalo (200ms) para controlar a velocidade da apresentação
  }

  stopReading() {
    clearInterval(this.readingInterval);
    this.readingInterval = null;
    this.currentIndex = 0; // Reset para começar do início ao reiniciar
  }
}
