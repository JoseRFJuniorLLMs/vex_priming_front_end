import { Component } from '@angular/core';

@Component({
  selector: 'vex-rsvpreader',
  standalone: true,
  imports: [],
  templateUrl: './rsvpreader.component.html',
  styleUrl: './rsvpreader.component.scss'
})
export class RsvpreaderComponent {
  text = 'Seu texto longo aqui. Este texto será dividido em palavras e mostrado sequencialmente.';
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
