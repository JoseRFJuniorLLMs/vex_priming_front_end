import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuillEditorComponent } from 'ngx-quill';

import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-dialog-example',
  templateUrl: 'dialog-example.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    QuillEditorComponent,
    MatRippleModule,
    MatTooltipModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DialogExampleComponent implements OnInit {
  @ViewChild('spectrogram') spectrogramEl: ElementRef | undefined;
  @ViewChild('waveform') waveformEl!: ElementRef;

  longText = ``;
  mediaRecorder?: MediaRecorder;
  audioChunks: any[] = [];
  isRecording = false;
  audio?: HTMLAudioElement;
  displayedHtml = ``; // Adicionado para armazenar e exibir HTML
  audioUrl: string | null = null;
  isPlaying: boolean = false;
  waveSurfer: WaveSurfer | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { texto: string },
    private dialogRef: MatDialogRef<DialogExampleComponent>
  ) { }

  ngOnInit() {
    this.initWaveSurfer();
  }

  ngAfterViewInit(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      url: '../../assets/audio/PRIMING.wav',
      waveColor: '#d3d3d3',
      progressColor: '#000000',
      cursorColor: '#000000',
      cursorWidth: 5,
      minPxPerSec: 50,
      barWidth: 10,
      barRadius: 2,
      barGap: 2,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      mediaControls: true, // controles
      autoplay: true,
      fillParent: true,
    });

    this.setupWaveSurferEvents();
  }

  setupWaveSurferEvents(): void {
    if (!this.waveSurfer) return;

    this.waveSurfer.on('play', () => {
      this.isPlaying = true;
    });

    this.waveSurfer.on('pause', () => {
      this.isPlaying = false;
    });

    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
    });

    // Adicione aqui outros eventos necessários
  }


  initWaveSurfer(): void {
    if (this.waveformEl) {
      this.waveSurfer = WaveSurfer.create({
        container: this.waveformEl.nativeElement,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio', // or 'MediaElement' if you want to use the <audio> backend
        // If you're including a spectrogram, you would also initialize it here
      });

      // Additional configuration for the spectrogram plugin can be set up here if needed
    }
  }
  // Função para atualizar o HTML que será exibido
  updateDisplayedHtml(htmlContent: string): void {
    this.displayedHtml = htmlContent;
  }

  toggleRecording(): void {
    this.isRecording ? this.stopRecording() : this.activateMicrophone();
    this.isRecording = !this.isRecording;
  }

  activateMicrophone(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
      })
      .catch(err => {
        console.error('Could not access the microphone', err);
      });
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.activateMicrophone();
      this.isRecording = true; // Ensure the recording state is updated
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioUrl = URL.createObjectURL(audioBlob); // Atualizar a URL do áudio

        if (this.waveSurfer) {
          this.waveSurfer.load(this.audioUrl); // Carregar o áudio gravado no WaveSurfer
        }

        this.loadAudio(this.audioUrl); // Carregar o áudio para o elemento HTMLAudioElement, se necessário
      };
    }
  }



  loadAudio(url: string): void {
    this.audio = new Audio(url);
  }

  playSound(): void {
    if (this.audio) {
      this.initWaveSurfer();
      this.audio.play().catch(error => console.error("Error playing sound:", error));
    }
  }

  pauseSound(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  stopSound(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
