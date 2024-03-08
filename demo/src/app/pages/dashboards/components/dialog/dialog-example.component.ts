import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
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
import gpt4 from '../../../../../../gpt4.json';

import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-dialog-example',
  templateUrl: 'dialog-example.component.html',
  styleUrls: ['dialog-example.component.scss'],
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
    MatIconModule,
    HttpClientModule

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
  displayedHtml = ``;
  audioUrl: string | null = null;
  isPlaying: boolean = false;
  waveSurfer: WaveSurfer | null = null;
  isGeneratingAudio = false;
  chatMessage: string = this.data.texto;
  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  isAudioReady: boolean = false;
  currentWordIndex: number = 0;
  words: string[] = [];

  constructor(
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { texto: string },
    private dialogRef: MatDialogRef<DialogExampleComponent>,
  ) { }

  ngOnInit() {
    this.words = this.chatMessage.split(' ');
    this.initWaveSurfer();
    this.playSound();
  }

  ngAfterViewInit(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      /* url: '../../assets/audio/ABOVE.wav', */
      waveColor: '#d3d3d3',
      progressColor: '#0000FF',
      cursorColor: '#0000FF',
      cursorWidth: 1,
      minPxPerSec: 30,
      barWidth: 5,
      barRadius: 30,
      barGap: 1,
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

    /* ==================VOZ ALEATORIA==================== */
    getRandomVoice(): string {
      const randomIndex = Math.floor(Math.random() * this.voices.length);
      return this.voices[randomIndex];
    }

    /* ==================GERADOR DE AUDIO==================== */
    generateAudio(): void {
      if (this.isGeneratingAudio) return;
      this.isGeneratingAudio = true;

      if (!this.chatMessage) {
        console.error('No chatMessage to generate audio from.');
        this.isGeneratingAudio = false;
        return;
      }

      const openAIKey = gpt4.gptApiKey;
      const url = "https://api.openai.com/v1/audio/speech";
      const body = {
        model: "tts-1",
        voice: this.getRandomVoice(),
        input: this.chatMessage
      };

      const headers = new HttpHeaders({
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json"
      });

      this.http.post(url, body, { headers, responseType: "blob" }).subscribe(
        response => {
          const audioBlob = new Blob([response], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);

          if (this.waveSurfer) {
            this.waveSurfer.load(audioUrl);
            this.waveSurfer.on('ready', () => {
              this.waveSurfer?.play();
              this.isAudioReady = true; // Marca o áudio como pronto para reprodução
            });
          }

          this.isGeneratingAudio = false;
        },
        error => {
          console.error("Error generating audio:", error);
          this.isGeneratingAudio = false;
        }
      );
    }

    transcribeAudio(audioBlob: Blob) {
      const openAIKey = gpt4.gptApiKey;
      const url = 'https://api.openai.com/v1/whisper';
      const formData = new FormData();
      formData.append('file', audioBlob);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${openAIKey}`
      });

      this.http.post(url, formData, { headers, observe: 'response' }).subscribe(
        (response: any) => {
          const transcribedText = response.body.text;
          console.error('TEXTO:', transcribedText);
          this.data.texto += (this.data.texto ? " " : "") + transcribedText;

        },
        error => {
          console.error('Error transcribing audio:', error);
        }
      );
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

  }

  initWaveSurfer(): void {
    if (this.waveformEl) {
      this.waveSurfer = WaveSurfer.create({
        container: this.waveformEl.nativeElement,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio',
      });

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
    if (!this.mediaRecorder) {
      return;
    }

    this.mediaRecorder.stop(); // Pare a gravação
    this.isRecording = false; // Atualize o estado de gravação

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl); // Libere a URL anterior, se houver
      }
      this.audioUrl = URL.createObjectURL(audioBlob); // Crie uma nova URL

      if (this.waveSurfer) {
        this.waveSurfer.load(this.audioUrl); // Carregue o áudio no WaveSurfer
      }

      this.loadAudio(this.audioUrl); // Carregue o áudio para reprodução direta
      this.transcribeAudio(audioBlob); // Inicie a transcrição do áudio

      // Lembre-se de limpar/resetar os audioChunks para uma nova gravação
      this.audioChunks = [];
    };

    // Adicione manuseio de erro conforme necessário
  }



  transcribeCurrentAudio() {
    if (this.audioChunks.length > 0) {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      this.transcribeAudio(audioBlob);
    } else {
      console.error('Nenhum áudio para transcrever');
    }
  }


  loadAudio(url: string): void {
    this.audio = new Audio(url);
  }

  playSound(): void {
    // Verifica se o áudio já foi gerado e está pronto para ser reproduzido
    if (this.waveSurfer && this.isAudioReady) {
      // Iniciar a reprodução do áudio
      this.waveSurfer.play();

      // Iniciar a marcação de palavra por palavra
      this.highlightWords();
    } else {
      // Caso o áudio ainda não tenha sido gerado, chame generateAudio primeiro
      // Isso pode exigir ajustes para garantir que o usuário saiba que o áudio está sendo processado
      this.generateAudio();
      // Você poderia, opcionalmente, usar um observável ou uma promise para esperar o áudio estar pronto
      // e então reproduzi-lo automaticamente ou permitir que o usuário aperte o botão novamente
    }
  }

  highlightWords(): void {
    const interval = setInterval(() => {
      // Verifica se todas as palavras foram destacadas
      if (this.currentWordIndex >= this.words.length) {
        clearInterval(interval); // Limpa o intervalo
        return;
      }

 // Atualiza o HTML exibido com a palavra atual destacada
 const highlightedText = this.words.slice(0, this.currentWordIndex + 1).join(' ');
 this.updateDisplayedHtml(highlightedText);

 // Move para a próxima palavra
 this.currentWordIndex++;
}, 400); // Intervalo de 1 segundo entre cada palavra (ajuste conforme necessário)
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
