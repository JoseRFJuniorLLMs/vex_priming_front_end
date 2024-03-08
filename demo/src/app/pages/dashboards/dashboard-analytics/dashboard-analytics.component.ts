import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import gpt4 from '../../../../../gpt4.json';

import { WidgetAssistantComponent } from '../components/widgets/widget-assistant/widget-assistant.component';
import { WidgetLargeChartComponent } from '../components/widgets/widget-large-chart/widget-large-chart.component';
import { WidgetLargeGoalChartComponent } from '../components/widgets/widget-large-goal-chart/widget-large-goal-chart.component';
import { WidgetQuickLineChartComponent } from '../components/widgets/widget-quick-line-chart/widget-quick-line-chart.component';
import { WidgetQuickValueCenterComponent } from '../components/widgets/widget-quick-value-center/widget-quick-value-center.component';
import { WidgetTableComponent } from '../components/widgets/widget-table/widget-table.component';

import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';

import { interval, Observable, Subscription } from 'rxjs';
import screenfull from 'screenfull';
import WaveSurfer from 'wavesurfer.js';
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';
/* import * as Annyang from 'annyang'; */

import { Course } from 'src/app/model/course/course';
import { Lesson } from 'src/app/model/lesson/lesson';
import { CoursesService } from '../../../services/courses.service';
import { LessonDetailsDialogComponent } from '../components/dialog-lesson/lesson-details-Dialog.component';
import { DialogExampleComponent } from '../components/dialog/dialog-example.component';


// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatBottomSheetModule, MatListModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    WidgetAssistantComponent,
    WidgetQuickLineChartComponent,
    WidgetLargeGoalChartComponent,
    WidgetQuickValueCenterComponent,
    WidgetLargeChartComponent,
    WidgetTableComponent,
    PageLayoutDemoComponent,
    MatTabsModule,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    VexPageLayoutComponent,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatTableModule

  ]
})

export class DashboardAnalyticsComponent implements OnInit, AfterViewInit {

  /* ==================COURSES SERVICES==================== */
  courses$!: Observable<Course[]>;
  displayedColumns: string[] = ['_id', 'name', 'objective', 'category', 'level', 'price', 'status', 'content', 'lessons'];

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private subscription: Subscription = new Subscription;
  public isPlaying: boolean = false;
  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  speechRecognition: any;
  isTranscribing = false;
  textToSpeech!: string;
  audioBlob!: Blob;
  audioUrl!: string;
  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';
  selectedText: string = '';
  data: any;
  currentTime!: string;
  progressPercentage: number = 0;
  mediaControlsEnabled: boolean = false;
  mediaControlIcon: string = 'mat:sports_esports';
  wordsArray: string[] = [];
  wordsDisplayed: number = 0;
  wordDuration: number = 0;
  result: any;
  imageDisplayed: boolean = false;
  dialogRef: any = null;
  isDialogOpen: boolean = false; // desativa globalmente
  private isGeneratingAudio: boolean = false;
  private readyListener: () => void;
  private finishListener: () => void;

  /* ==================CONTRUTOR==================== */
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private coursesService : CoursesService
  ) {
    this.readyListener = () => {};
    this.finishListener = () => {};
  }

  /* ==================openDialog==================== */
  openDialog(textDisplay: string): void {
    this.isDialogOpen = true;
    // Verifica se já existe um diálogo aberto
    if (this.dialogRef) {
      // Fecha o diálogo atual antes de abrir um novo
      this.dialogRef.close();
    }

    // Abre o novo diálogo e armazena sua referência
    this.dialogRef = this.dialog.open(DialogExampleComponent, {
      width: '600px',
      data: { texto: textDisplay }
    });

    // Quando o diálogo for fechado, limpa a referência
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.isDialogOpen = false; // Resetar quando o diálogo é fechado
    });
  }

  /* ==================OnINIT==================== */
  ngOnInit(): void {

    this.coursesService.getCoursesByStudentId('65c6b529c2c6b863b27a3172').subscribe(cursos => {
      console.log('Cursos do estudante:', cursos);
    });

    const studentId = 'student_id';
    this.courses$ = this.coursesService.getCoursesByStudentId(studentId);

    // Definindo colunas dinamicamente com base na entidade Course (exemplo simplificado)
    this.displayedColumns = this.getColumnsFromCourseEntity();

    this.waveform.play();
    this.subscription = interval(1000).subscribe(() => {
      this.getCurrentTime();
    });

    if (screenfull.isEnabled) {
      screenfull.request();
    }
    this.speechRecognition.continuous = true;
  }

   /* ==================COLUMNS COURSE==================== */
  private getColumnsFromCourseEntity(): string[] {
      return ['_id', 'name', 'objective', 'category'];
  }

  /* ==================OnDESTROY==================== */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*questionToOpenAI CONSOME API DA OPEN IA, recebe question, retorna messages */
  async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: "repeat this word:" + question +",more three priming sentences that contain the word" }],
        temperature: 0.0,//0.5
        max_tokens: 30,//4000
        model: "gpt-4",
      }, { headers }).toPromise();
      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        throw new Error("Resposta da API não contém dados válidos.");
      }

      this.chatMessage = response.choices[0].message.content;
      // Calcula o tempo necessário para exibir o texto
      const displayTime = this.displayTextWordByWord(this.chatMessage);

      // Define um atraso para iniciar a reprodução do áudio, baseado no tempo de exibição do texto
      setTimeout(() => {
        // Função que carrega e reproduz o áudio
        this.generateAudio();
      }, displayTime);

      // Opção de exibir a mensagem em um Snackbar imediatamente,
      //this.openSnackBar(this.chatMessage);

    } catch (error) {
      // Tratamento de erros
      this.errorText = "Falha ao obter resposta da API: " + (error as Error).message;
    } finally {
      // Sempre será executado após a tentativa ou captura de bloco
      this.isLoading = false;
    }
  }

  /* ==================WAVESURFER==================== */
  ngAfterViewInit(): void {
    this.isPlaying = true;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      /*  url: 'https://storage.googleapis.com/priming_text_wav/ABOVE.wav', */

      url: '../../assets/audio/PRIMING.wav',
      waveColor: '#d3d3d3',
      progressColor: '#000000',
      /*       waveColor: 'rgb(200, 0, 200)',
            progressColor: '#000000', */
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
      mediaControls: false, //controles
      autoplay: true,
      fillParent: true,
    });

    this.waveform.on('audioprocess', () => {
      this.updateTextDisplayBasedOnAudio();
    });
  }

  events() {
    this.waveform.once('interaction', () => {
      this.waveform.play();
    })

    this.waveform.on('play', () => {
      this.isPlaying = true;
    })

    this.waveform.on('pause', () => {
      this.isPlaying = false;
    })
  }

  /* ==================FUNCAO PARA PEGAR O ARRAY DE STRING==================== */
  getWordsArray(text: string): string[] {
    return text.split(' ');
  }

  /* ==================CARREGAR E DA PLAY AUDIO==================== */
  loadAndPlayAudio(audioUrl: string, text: string, onAudioFinish?: () => void): void {
    this.wordsArray = this.getWordsArray(text); // Divide o texto em palavras
    this.wordsDisplayed = 0; // Reseta o contador de palavras exibidas

    // Carrega o áudio a partir da URL fornecida
    this.waveform.load(audioUrl);

    // Quando o WaveSurfer estiver pronto, calcula a duração de cada palavra e inicia a reprodução
    this.waveform.on('ready', () => {
        const duration = this.waveform.getDuration(); // Obtém a duração total do áudio
        this.wordDuration = duration / this.wordsArray.length; // Calcula a duração de cada palavra
        this.waveform.play(); // Inicia a reprodução do áudio
    });

    // Adiciona um listener para o evento de término do áudio
    // Se um callback foi fornecido, ele será chamado ao terminar a reprodução
    this.waveform.on('finish', () => {
        if (onAudioFinish) {
            onAudioFinish(); // Chama o callback fornecido
        }
    });
}


/* ==================FULL TEXT==================== */
displayFullText(text: string): void {
  const displayElement = document.getElementById('textDisplay');
  if (displayElement) {
      displayElement.textContent = text;
  }
}

  /* ==================ATUALIZA O TEXTO BASEADO NO AUDIO==================== */

  updateTextDisplayBasedOnAudio(): void {
    // Verifica se a imagem já foi exibida. Se sim, não faz nada para evitar sobrepor a imagem.
    if (this.imageDisplayed) {
      return;
    }

    // Se a imagem ainda não foi exibida, continua com a lógica de atualizar o texto baseado no progresso do áudio.
    const currentTime = this.waveform.getCurrentTime(); // Obtém o tempo atual do áudio.
    const expectedWords = Math.floor(currentTime / this.wordDuration); // Calcula quantas palavras deveriam ter sido faladas até o momento.

    // Atualiza o displayElement para mostrar as palavras até o ponto esperado.
    const displayElement = document.getElementById('textDisplay');
    if (displayElement) {
      // Atualiza o texto no displayElement com as palavras correspondentes ao tempo atual do áudio.
      displayElement.textContent = this.wordsArray.slice(0, expectedWords).join(' ');
    }
  }

  /* ==================PLAY AUDIO TEXTO SICRONIZADO==================== */
  startAudioWithText(audioUrl: string, text: string) {
    this.loadAndPlayAudio(audioUrl, text);
  }

  /* ==================PLAY AUDIO==================== */
  playAudio() {
    this.waveform.play();
  }

  /* ==================PAUSE AUDIO==================== */
  pauseAudio() {
    this.waveform.pause();
  }

  /* ==================STOP AUDIO==================== */
  stopAudio() {
    this.waveform.stop();
  }

  /* ==================CURRENT TIME==================== */
  getCurrentTime(): void {
    const currentTime = this.waveform.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    this.currentTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  /* ==================CALCULA PORCENTAGEM DE PROGRESSO==================== */
  calculateProgressPercentage(): void {
    const duration = this.waveform.getDuration();
    const currentTime = this.waveform.getCurrentTime();
    this.progressPercentage = (currentTime / duration) * 100;
  }

    /* ==================MOSTRO OS CONTROLES DO VOLUME==================== */
  toggleMediaControls(): void {
    this.mediaControlsEnabled = !this.mediaControlsEnabled;
    this.waveform.setOptions({ mediaControls: this.mediaControlsEnabled });
    this.mediaControlIcon = this.mediaControlsEnabled ? 'mat:sports_esports' : 'mat:cloud_download';
  }

  /* ==================VOZ ALEATORIA==================== */
  getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.voices.length);
    return this.voices[randomIndex];
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, "Close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1,
    });

    snackBarRef.afterDismissed().subscribe(() => {
      //this.playSound('../../../../assets/audio/toc.wav');
      //this.openDialog(textDisplay);
    });
  }

   /* ==================ALARME==================== */
  playSound(soundUrl: string) {
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error("Erro ao tocar o som:", error));
  }

  /* ==================AO SELECIONAR O TEXTO==================== */
  @HostListener('document:mouseup', ['$event'])
  handleMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (this.isDialogOpen) {
      return; // Não fazer nada se o diálogo estiver aberto
    }
    if (selection && selection.toString().trim() !== '') {
      this.selectedText = selection.toString();
      this.questionToOpenAI(this.selectedText);
    }
  }

  /* ==================GERA AUDIO==================== */
  generateAudio(): void {
    // Verifica se já está gerando áudio para evitar duplicação
    if (this.isGeneratingAudio) return;

    // Indica que o processo de geração de áudio começou
    this.isGeneratingAudio = true;

    if (!this.chatMessage) {
      console.error('No chatMessage to generate audio from.');
      // Restaura o estado para permitir novas gerações de áudio
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
      "Authorization": `Bearer ${openAIKey}`
    });

    this.http.post(url, body, { headers, responseType: "blob" }).subscribe(
      response => {
        const audioBlob = new Blob([response], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Define as funções listener que serão usadas nos eventos 'ready' e 'finish'
        const onReady = () => {
          this.waveform.play();
        };

        const onFinish = () => {
          // Ações adicionais após a conclusão do áudio
          this.isGeneratingAudio = false;
          this.playSound('../../../../assets/audio/toc.wav');
          this.openDialog(this.chatMessage);

          // Limpa os listeners após seu uso
          this.waveform.un('ready', onReady);
          this.waveform.un('finish', onFinish);
        };

        // Limpa quaisquer listeners anteriores (necessário se a função for chamada múltiplas vezes)
        this.waveform.un('ready', onReady);
        this.waveform.un('finish', onFinish);

        // Carrega o áudio no WaveSurfer e define os listeners
        this.waveform.load(audioUrl);
        this.waveform.on('ready', onReady);
        this.waveform.on('finish', onFinish);
      },
      error => {
        console.error("Error generating audio:", error);
        // Restaura o estado em caso de erro
        this.isGeneratingAudio = false;
      }
    );
  }


  /* ==================DISPLAY WORD BY WORD AND SHOW IMAGE==================== */
displayTextWordByWord(text: string): number {
  const words = text.split(' ');
  const displayElement = document.getElementById('textDisplay');
  if (!displayElement) return 0; // Se o elemento não existir, retorna 0.

  let i = 0;
  displayElement.textContent = ''; // Inicializa o conteúdo do displayElement como vazio.

  const wordDisplayInterval = 900; // Intervalo em milissegundos
  const totalTime = words.length * wordDisplayInterval;

  const intervalId = setInterval(() => {
    if (i < words.length) {
      displayElement.innerText += words[i] + ' ';
      i++;
    } else {
      clearInterval(intervalId);
      // Após exibir todas as palavras, limpa o texto e insere a imagem.
      displayElement.innerHTML = '<img src="/assets/img/logo/priming.png" alt="Priming Logo" style="max-width: 100%; height: auto;">';
      this.imageDisplayed = true; // Imagem exibida, atualize a flag
    }
  }, wordDisplayInterval);

  return totalTime;
}

  openLessonsDialog(lessons: Lesson[]): void {
    this.dialog.open(LessonDetailsDialogComponent, {
      width: '90%',
      data: { lessons }
    });
  }

}







