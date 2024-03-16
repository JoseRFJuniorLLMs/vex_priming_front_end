import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HighlightModule } from 'ngx-highlightjs';
import { QuillEditorComponent } from 'ngx-quill';

import nlp from 'compromise';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import gpt4 from '../../../../../../gpt4.json';

declare var SpeechRecognition: any;

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
    HttpClientModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
    HighlightModule,
    MatProgressSpinnerModule,
    CommonModule

  ]
})

export class DialogExampleComponent implements OnInit {

  @ViewChild('spectrogram') spectrogramEl: ElementRef | undefined;
  @ViewChild('waveform') waveformEl!: ElementRef;
  @ViewChild('stepper') stepper!: MatStepper;

  longText = ``;
  errorText = '';
  isLoading = false;
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

  //NLP
  // Manipulação de Texto
  textNLP: string = '';
  pronouns: string[] = []; // Pronome
  verbs: string[] = []; // Verbo
  nouns: string[] = []; // Substantivo
  adjectives: string[] = []; // Adjetivo
  adverbs: string[] = []; // Advérbio
  people: string[] = []; // Pessoas
  places: string[] = []; // Lugares
  organizations: string[] = []; // Organizações
  dates: string[] = []; // Datas
  values: string[] = []; // Valores

  // Adicionando novas variáveis para funcionalidades adicionais
  phrases: any[] = []; // Frases
  clauses: string[] = []; // Cláusulas
  negations: string[] = []; // Negativas
  questions: string[] = []; // Perguntas
  quotes: string[] = []; // Citações
  acronyms: string[] = []; // Siglas
  emails: string[] = []; // E-mails
  urls: string[] = []; // URLs
  emojis: string[] = []; // Emojis
  mentions: string[] = []; // Menções (@usuario)
  hashtags: string[] = []; // Hashtags

  private recognition: any;
  public transcript = new Subject<string>();

  displayedContent: string = "";
  transcriptionResult: string = '';

  constructor(
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { texto: string },
    private dialogRef: MatDialogRef<DialogExampleComponent>
  ) {}

  private initializeRecognition(): void {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      this.transcript.next(transcript);
    };

    this.recognition.onerror = (event: { error: any; }) => {
      console.error('Erro de reconhecimento de voz:', event.error);
    };
  }

  ngOnInit() {
    this.words = this.chatMessage.split(' ');
    this.initWaveSurfer();
    this.playSound();
    this.performAnalysis();

    this.transcript.subscribe({
      next: (text) => {
        this.displayedContent = text; // Atualiza o conteúdo exibido
        console.log("AQUI»»»»»»»»»»»»»»»»:"+text); // Exibe o texto transcrito no console
      }
    });
  }

  ngAfterViewInit(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
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

/*   toggleRecording(): void {
    this.isRecording ? this.stopRecording() : this.activateMicrophone();
    this.isRecording = !this.isRecording;
  } */

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
      // Lógica para iniciar a gravação
      this.activateMicrophone();
      this.isLoading = true;
      this.isRecording = true;
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      // Lógica para parar a gravação
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        // Handle stopping logic here, e.g., process the recorded audio
      } else {
        console.error('Tentativa de parar a gravação, mas o MediaRecorder não está definido ou já está inativo.');
      }
      this.isLoading = false;
      this.isRecording = false;
    }
  }

  // ================= Stop Recording ================//
/*   stopRecording(): void {
    this.isLoading = false;
    if (!this.mediaRecorder) {
      console.error('Tentativa de parar a gravação, mas o MediaRecorder não está definido.');
      return;
    }

    // Evento onstop movido para fora para garantir que só é definido uma vez e não a cada chamada de stopRecording.
    this.mediaRecorder.onstop = this.handleRecordingStopped.bind(this);

    // Pare a gravação e atualize o estado de gravação
    this.mediaRecorder.stop();
    this.isRecording = false;
  }*/

  // Nova função para lidar com a lógica após a gravação ser parada
/* private handleRecordingStopped(): void {
  const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

  // Libere a URL anterior, se houver
  if (this.audioUrl) {
    URL.revokeObjectURL(this.audioUrl);
  }

  // Crie uma nova URL para o Blob de áudio e carregue-o para reprodução e visualização
  this.audioUrl = URL.createObjectURL(audioBlob);

  this.loadAndVisualizeAudio(this.audioUrl);

  // Reset dos chunks de áudio para a próxima gravação
  this.audioChunks = [];
}
 */

private handleRecordingStopped(): void {
  const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

  // Libere a URL anterior, se houver
  if (this.audioUrl) {
    URL.revokeObjectURL(this.audioUrl);
  }

  // Crie uma nova URL para o Blob de áudio e carregue-o para reprodução e visualização
  this.audioUrl = URL.createObjectURL(audioBlob);
  this.loadAndVisualizeAudio(this.audioUrl);

  // Converter Blob para Base64 e enviar para a Google Cloud Speech-to-Text API
  this.blobToBase64(audioBlob).then(base64Audio => {
    const audioContent = base64Audio.split(',')[1]; // Remover prefixo da string base64
    this.transcribeAudio(audioContent);
  }).catch(error => console.error('Erro ao converter áudio para base64:', error));

  // Reset dos chunks de áudio para a próxima gravação
  this.audioChunks = [];
}

// Função para carregar e visualizar o áudio
private loadAndVisualizeAudio(audioUrl: string): void {
  if (this.waveSurfer) {
    this.waveSurfer.load(audioUrl);
  }

  // Substitua loadAudio por qualquer lógica necessária para reproduzir o áudio
  this.loadAudio(audioUrl);
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

      // Avança para a próxima etapa após a reprodução do áudio
      setTimeout(() => {
        this.stepper.next();
      }, this.waveSurfer.getDuration() * 1000); // Espere pela duração do áudio antes de avançar
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


  performAnalysis(): void {
    // Atualiza textNLP com o valor de chatMessage
    this.textNLP = this.chatMessage;
    // Agora chama analyzeText para processar o texto
    this.analyzeText();
  }

  public startTranscription(): void {
    if (this.recognition) {
      this.recognition.start();
    } else {
      console.log('SpeechRecognition não está disponível.');
    }
  }

  stopTranscription() {
    this.recognition.stop();
  }

  getTranscript() {
    return this.transcript.asObservable();
  }


  private transcribeAudio(audioContent: string): void {
    const url = 'https://speech.googleapis.com/v1p1beta1/speech:recognize?key=AIzaSyDNv17QRY5QWgDgwghDN2mBYG_owl5JVSo';
    const body = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
      audio: {
        content: audioContent,
      },
    };

    this.http.post<any>(url, body).subscribe(
      response => {
        console.log('Resposta da transcrição:', response);
        // Processa a resposta para exibir a transcrição
        if (response.results && response.results.length > 0 && response.results[0].alternatives && response.results[0].alternatives.length > 0) {
          this.transcriptionResult = response.results[0].alternatives[0].transcript;
        } else {
          this.transcriptionResult = 'Não foi possível transcrever o áudio.';
        }
      },
      error => {
        console.error('Erro ao enviar áudio para a transcrição:', error);
        if (error.error && error.error.message) {
          console.error('Detalhe do Erro:', error.error.message);
        }
        this.transcriptionResult = 'Erro ao processar a transcrição.';
      }
    );
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }




  analyzeText() {
    const doc = nlp(this.chatMessage);
    // Análise básica
    this.pronouns = doc.pronouns().out('array');
    this.verbs = doc.verbs().out('array');
    this.nouns = doc.nouns().out('array');
    this.adjectives = doc.adjectives().out('array');
    this.adverbs = doc.adverbs().out('array');
    this.people = doc.people().out('array');
    this.places = doc.places().out('array');
    this.organizations = doc.organizations().out('array');
    //this.dates = doc.dates().out('array');
    //this.values = doc.values().out('array');
    // Funcionalidades adicionais
    //this.phrases = doc.phrases().out('any'); // Frases
    this.clauses = doc.clauses().out('array'); // Cláusulas
    //this.negations = doc.negations().out('array'); // Negativas
    this.questions = doc.questions().out('array'); // Perguntas
    //this.quotes = doc.quotes().out('array'); // Citações
    this.acronyms = doc.acronyms().out('array'); // Siglas
    this.emails = doc.emails().out('array'); // E-mails
    this.urls = doc.urls().out('array'); // URLs
    //this.emojis = doc.emojis().out('array'); // Emojis
    //this.mentions = doc.mentions().out('array'); // Menções (@usuario)
    //this.hashtags = doc.hashtags().out('array'); // Hashtags
    // Nota: Algumas dessas funcionalidades podem requerer plugins adicionais ou implementação específica.
  }

  //fim
}
