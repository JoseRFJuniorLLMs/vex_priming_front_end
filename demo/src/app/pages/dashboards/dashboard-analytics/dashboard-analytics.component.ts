import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

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
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';


import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
/* import {
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog'; */


import { interval, Subscription } from 'rxjs';
import screenfull from 'screenfull';
import WaveSurfer from 'wavesurfer.js';
/* import * as Annyang from 'annyang'; */

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule, MatBottomSheetModule, MatListModule,
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
    MatProgressSpinnerModule

  ]
})


export class DashboardAnalyticsComponent implements OnInit , AfterViewInit {

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
  mediaControlsEnabled: boolean = true;
  mediaControlIcon: string = 'mat:sports_esports';

      /* ==================CONTRUTOR==================== */
      constructor(
        private http: HttpClient,
        private _snackBar: MatSnackBar
      ) {}

      /* ==================OnINIT==================== */
      ngOnInit(): void {
        this.waveform.play();
        this.subscription = interval(1000).subscribe(() => {
        this.getCurrentTime();
        });

        if (screenfull.isEnabled) {
          screenfull.request();
        }
        this.speechRecognition.continuous = true;
      }

      /* ==================OnDESTROY==================== */
      ngOnDestroy(): void {
        this.subscription.unsubscribe();
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
          mediaControls: true, //controles
          autoplay: true,
          fillParent: true,
        });

      this.waveform.on('audioprocess', () => {
       this.getCurrentTime();
       this.calculateProgressPercentage();

      });
        this.events();
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
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Save Notes', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    this.generateAudio();
  }


 /*

     questionToOpenAI CONSOME API DA OPEN IA, recebe question, retorna messages )

*/

async questionToOpenAI(question: string) {
  this.isLoading = true;
  try {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
      "Content-Type": "application/json"
    });

    const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
      messages: [{ role: 'user', content: question }],
      temperature: 0.0,//0.5
      max_tokens: 50,//4000
      model: "gpt-4",
    }, { headers }).toPromise();
         // Verificando se a resposta é indefinida
         if (response === undefined) {
          throw new Error("Resposta indefinida.");
        }
        // Verificando se a propriedade 'choices' está presente na resposta
        if (response.choices && response.choices.length > 0) {
          this.chatMessage = response.choices[0].message.content;
          // Chamando a função para exibir o Snackbar com a mensagem processada
          this.openSnackBar(this.chatMessage);
        } else {
          throw new Error("Resposta inválida.");
        }
      } catch (error) {
        this.errorText = (error as any).error.message;
      } finally {
        this.isLoading = false;
      }
    }

    /* ==================AO SELECIONAR O TEXTO==================== */
    @HostListener('document:mouseup', ['$event'])
    handleMouseUp(event: MouseEvent) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        this.selectedText = selection.toString();
        this.questionToOpenAI(this.selectedText);
      }
    }

    /* ==================GERA AUDIO==================== */

    generateAudio(): void {
      if (!this.chatMessage) {
         console.error('No chatMessage to generate audio from.');
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

      this.http.post(url, body, { headers, responseType: "blob"}).subscribe(response => {
          const audioBlob = new Blob([response], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);

       // Carregar o áudio gerado no WaveSurfer
      this.waveform.load(audioUrl);

      // Reproduzir o áudio gerado pelo GPT-4 usando o objeto Audio
      const audio = new Audio(audioUrl);

        });
    }


 }







