import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EMPTY, Subscription } from 'rxjs';
import { SharedDataService } from 'src/app/services/sahred-data.service';

@Component({
  selector: 'rsvpreader',
  standalone: true,
  templateUrl: './rsvpreader.component.html',
  styleUrls: ['./rsvpreader.component.scss'],
  imports: [MatIconModule, CommonModule, FormsModule, MatTooltipModule, MatButtonModule]
})
export class RsvpreaderComponent {
  @Input() text: string = '';
  selectedText: string = '';
  words: string[] = [];
  currentWord = '';
  currentWordFormatted: SafeHtml | undefined;
  currentIndex = 0;
  readingInterval: any;
  intervalSpeed = 200;
  private textSubscription: Subscription = EMPTY.subscribe();

  constructor(private sharedDataService: SharedDataService, private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.words = this.text.split(',').map(word => word.trim());
    this.currentIndex = 0;
  }

  ngOnDestroy() {
    this.textSubscription.unsubscribe();
    this.stopReading();
  }

  startReading() {
    if (this.readingInterval) {
      return; // Impede a criação de múltiplos intervalos se já estiver lendo
    }

    this.readingInterval = setInterval(() => {
      if (this.currentIndex < this.words.length) {
        const word = this.words[this.currentIndex++];
        this.currentWord = word;
        this.currentWordFormatted = this.formatWord(word);
      } else {
        this.stopReading(); // Para a leitura quando todas as palavras forem lidas
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
    return this.sanitizer.bypassSecurityTrustHtml(word);
  }
}
