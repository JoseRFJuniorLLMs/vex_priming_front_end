import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'vex-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    RouterOutlet,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ]
})
export class FooterComponent implements OnInit, OnDestroy {

  constructor(private cdr: ChangeDetectorRef) { }

  displayTime: string = '25:00';
  timer: any;
  durationInSeconds: number = 5;

  selected: string | null = null;
  icon1: string = 'some-icon1'; // Replace with your actual icons
  icon2: string = 'some-icon2';

  icon60fps: string = 'mat:60fps';
  icon30fps: string = 'mat:30fps';

changeIcons(): void {
  this.icon60fps = 'mat:60fps_select';
  this.icon30fps = 'mat:30fps_select';
}

  onToggleChange(selection: string) {
    if (selection === 'get-vex3') {
      // Exclusive mode - Deselect others
      if (this.selected !== 'get-vex3') {
        this.selected = 'get-vex3';
      } else {
        this.selected = null;
      }
    } else {
      // If another toggle is selected, clear 'get-vex3'
      this.selected = selection;
    }
  }
  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

paused: boolean = false;
remainingSeconds: number = 0;

startTimer(): void {
  if (this.paused) {
    // Se estiver pausado, continue de onde parou
    this.timer = setInterval(() => {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      this.displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      //this.displayTime = `${minutes}`;
      this.cdr.detectChanges();  // Adicione esta linha

      if (this.remainingSeconds === 0) {
        this.stopTimer();
        //this.openDialog();
      } else {
        this.remainingSeconds--;
      }
    }, 1000);
  } else {
    // Se não estiver pausado, inicie um novo timer
    this.stopTimer(); // Certifique-se de parar o temporizador antes de iniciar um novo
    const duration = 25 * 60;
    this.remainingSeconds = duration;

    this.timer = setInterval(() => {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      this.displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      //this.displayTime = `${minutes}`;
      this.cdr.detectChanges();  // Adicione esta linha
      this.remainingSeconds--;
    }, 1000);
  }
}

stopTimer(): void {
  clearInterval(this.timer);
}

pauseTimer(): void {
  clearInterval(this.timer);
  this.paused = true;
}

continueTimer(): void {
  if (!this.paused) return;

  // Reinicie o timer com o tempo restante
  this.startTimer();
  this.paused = false;
}

progress: number = 0;

stopProgressBar(): void {
  clearInterval(this.timer);
  this.paused = true;
  this.progress = 0;
}


}
