import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';


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
    MatTooltipModule
  ]
})
export class FooterComponent implements OnInit, OnDestroy {

  displayTime: string = '25:00';
  timer: any;
  durationInSeconds: number = 5;

  constructor() {}

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

      if (this.remainingSeconds === 0) {
        this.stopTimer();
        //this.openDialog();
      } else {
        this.remainingSeconds--;
      }
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


}
