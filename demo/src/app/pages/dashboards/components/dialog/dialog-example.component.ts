import { Component, Inject } from '@angular/core';
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
export class DialogExampleComponent {
  longText = ``;
  mediaRecorder?: MediaRecorder;
  audioChunks: any[] = [];
  isRecording = false;
  audio?: HTMLAudioElement;
  displayedHtml = ``; // Adicionado para armazenar e exibir HTML

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { texto: string },
    private dialogRef: MatDialogRef<DialogExampleComponent>
  ) { }

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
        const audioUrl = URL.createObjectURL(audioBlob);
        this.loadAudio(audioUrl);
      };
    }
  }

  loadAudio(url: string): void {
    this.audio = new Audio(url);
  }

  playSound(): void {
    if (this.audio) {
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
