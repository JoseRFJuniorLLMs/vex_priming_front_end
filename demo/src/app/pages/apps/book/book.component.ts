import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import ePub from 'epubjs';
import WaveSurfer from 'wavesurfer.js';
import gpt4 from '../../../../../gpt4.json';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({

  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatBadgeModule, MatCardModule, MatIconModule, MatSelectModule, FormsModule, MatTooltipModule]

})
export class BookComponent implements OnInit, AfterViewInit {

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private isGeneratingAudio: boolean = false;
  public isPlaying: boolean = false;
  public currentPageText: string = '';

   book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;
  durationInSeconds = 130;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  isLoading = false;
  chatMessage: any;
  errorText = '';
  imageDisplayed: boolean = false;

  wordDuration: number = 0;
  wordsArray: string[] = [];

  selectedLayoutOption = 'default';

  constructor(private http: HttpClient, private _snackBar: MatSnackBar,) {}

  ngOnInit() {
    this.initializeBook();

  }

  //initializeBook
  async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/TheLittlePrince.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao");
      await this.book.locations.generate();
      this.totalPages = this.book.locations.length(); // Atualiza o total de páginas
      this.rendition.display();

      // Adicionando um ouvinte para o evento 'relocated' com tipo 'any' para o parâmetro 'location'
      this.rendition.on('relocated', async (location: any) => {
        // Chamada para a função que captura o texto da página atual
        this.currentPageText = await this.getCurrentPageText();
        // Agora você tem o texto da página atual em this.currentPageText
        // Você pode fazer o que precisar com ele aqui
        console.log(this.currentPageText);
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }

  //getCurrentPageText
  async getCurrentPageText(): Promise<string> {
    if (!this.rendition) {
      return '';
    }
    const currentContents = this.rendition.getContents();
    if (currentContents.length === 0) {
      return ''; // Verifica se há algum conteúdo retornado
    }

    let text = '';
    currentContents.forEach((content: any) => {
      text += content.document.body.textContent || ''; // Concatena o texto de cada conteúdo
    });

    return text;
  }

  //toggleLayout
  toggleLayout() {
    return () => {
      this.rendition.spread = (this.rendition.spread === "none") ? "always" : "none";
      this.rendition.display();
      this.openSnackBar(this.rendition.display());
    };
  }

  nextPage() {
    this.openSnackBar("nextPage"+this.rendition.next().length);
    this.rendition.next();
  }

  prevPage() {
    this.openSnackBar("prevPage"+this.rendition.prev().length);
    this.rendition.prev();
  }

  zoomIn() {
    this.openSnackBar("zoomIn");
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
    this.openSnackBar("zoomOut");
    this.rendition.themes.fontSize('100%');
  }

  clearSelection() {
    this.selectedText = '';
  }

  copySelectedText() {
    this.openSnackBar("copySelectedText");
    navigator.clipboard.writeText(this.selectedText);
  }

/*questionTo OpenAI CONSOME API DA OPEN IA, recebe question, retorna messages */
async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: "repeat this word:" + question +",more 3 priming sentences, children's phrases that contain the word" }],
        //messages: [{ role: 'user', content: "repeat this word:" + question }],
        temperature: 0.0,//0.5
        max_tokens: 1000,//4000
        model: "gpt-4",
      }, { headers }).toPromise();
      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        throw new Error("Resposta da API não contém dados válidos.");
      }

      this.chatMessage = response.choices[0].message.content;
      // Calcula o tempo necessário para exibir o texto
      const displayTime = this.displayTextWordByWord(this.chatMessage);
      const currentPageText = await this.getCurrentPageText();
      // Define um atraso para iniciar a reprodução do áudio, baseado no tempo de exibição do texto
      setTimeout(() => {
        // Função que carrega e reproduz o áudio
        this.generateAudio(currentPageText);
      }, displayTime);

      // Opção de exibir a mensagem em um Snackbar imediatamente,
      this.openSnackBar(this.chatMessage);

    } catch (error) {
      // Tratamento de erros
      this.errorText = "Falha ao obter resposta da API: " + (error as Error).message;
    } finally {
      // Sempre será executado após a tentativa ou captura de bloco
      this.isLoading = false;
    }
  }

//fim IA

  //countPages
  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    this.openSnackBar("countPages:"+numberOfPages);
    return numberOfPages;
  }

  //getCurrentPage
  getCurrentPage(): number {
    const currentPageIndex = this.book && this.book.navigation && this.book.navigation.indexOf(this.book.currentLocation);
    this.openSnackBar("countPages:"+ currentPageIndex + 1);
    return currentPageIndex + 1;
  }

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch(option) {
      case 'default':
        this.openSnackBar("Default");
        // Possivelmente, manter padrões ou aplicar configurações específicas
        break;
      case 'continuous':
        this.openSnackBar("Continuous");
        flowValue = 'scrolled-doc'; // ou 'scrolled' dependendo da versão do epub.js
        break;
      case 'paginated':
        this.openSnackBar("Paginated");
        flowValue = 'paginated';
        width = '900px';
        height = '600px';
        break;
      case 'auto':
        this.openSnackBar("Auto");
        // Definir lógica para 'auto', se aplicável
        break;
    }

    if (flowValue) {
      this.openSnackBar("flowValue");
      this.rendition.flow(flowValue);
    }

    if (width && height) {
      this.openSnackBar("height");
      this.rendition.resize(width, height);
    }

    // Re-renderizar o conteúdo no ponto atual
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation) {
      this.openSnackBar(currentLocation.stringify(currentLocation(currentLocation)));
      this.rendition.display(currentLocation.start.cfi);
    }
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, "Close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100,
    });
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
        //displayElement.innerHTML = '<img src="/assets/img/logo/priming.png" alt="Priming Logo" style="max-width: 100%; height: auto;">';
        this.imageDisplayed = true; // Imagem exibida, atualize a flag
      }
    }, wordDisplayInterval);

    return totalTime;
  }

  /* ==================GERA AUDIO==================== */
/*   generateAudio(): void {
    // Verifica se já está gerando áudio para evitar duplicação
    if (this.isGeneratingAudio) return;

    // Indica que o processo de geração de áudio começou
    this.isGeneratingAudio = true;

    if (!this.chatMessage) {
      console.error('No chatMessage to generate audio from.');
      this.openSnackBar("No chatMessage to generate audio from.");
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
          //this.playSound('../../../../assets/audio/music.mp3');
          this.openDialog(this.chatMessage);
          this.openSnackBar(this.chatMessage);
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
  } */

  // Função para gerar áudio a partir do texto selecionado ou da página atual.
generateAudio(text: string): void {
  // Verifica se já está gerando áudio para evitar duplicação
  if (this.isGeneratingAudio) return;

  // Indica que o processo de geração de áudio começou
  this.isGeneratingAudio = true;

  // Garante que haja texto para gerar áudio
  if (!text) {
    console.error('No text provided for audio generation.');
    this.openSnackBar("No text provided for audio generation.");
    this.isGeneratingAudio = false;
    return;
  }

  // Configuração da requisição para a API de TTS
  const body = {
    model: "text:to:speech:model", // Substitua pelo modelo correto da sua API de TTS
    input: text,
    // Adicione quaisquer outros parâmetros necessários pela sua API de TTS aqui
  };

  const headers = new HttpHeaders({
    "Authorization": `Bearer ${gpt4.gptApiKey}`, // Substitua pelo seu token de API
    "Content-Type": "application/json"
  });

  const ttsApiUrl = "https://api.openai.com/v1/audio/speech"; // Substitua pela URL correta da sua API de TTS

  // Envio da requisição para a API de TTS
  this.http.post(ttsApiUrl, body, { headers, responseType: "blob" }).subscribe(
    response => {
      const audioBlob = new Blob([response], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      this.waveform.load(audioUrl); // Carrega o áudio no WaveSurfer para reprodução
      this.isGeneratingAudio = false;
    },
    error => {
      console.error("Error generating audio:", error);
      this.isGeneratingAudio = false;
    }
  );
}



  getRandomVoice() {
    throw new Error('Method not implemented.');
  }
  playSound(arg0: string) {
    throw new Error('Method not implemented.');
  }
  openDialog(chatMessage: any) {
    throw new Error('Method not implemented.');
  }

  /* ==================WAVESURFER==================== */
  ngAfterViewInit(): void {
    this.isPlaying = true;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      /*  url: 'https://storage.googleapis.com/priming_text_wav/ABOVE.wav', */

      url: '../../assets/audio/ABOVE.wav',
      waveColor: '#d3d3d3',
      progressColor: 'rgb(0, 0, 0)',
      /*       waveColor: 'rgb(200, 0, 200)',
            progressColor: '#000000', */
      cursorColor: 'rgb(0, 0, 0)',
      cursorWidth: 1,
      minPxPerSec: 10,
      barWidth: 1,
      barRadius: 1,
      barGap: 1,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      mediaControls: true, //controles
      autoplay: true,
      fillParent: true,
      height: 50,
    });

    this.waveform.on('audioprocess', () => {
      this.updateTextDisplayBasedOnAudio();
    });
  this.waveform.setVolume(0.1); // 10/100
  this.waveform.on('audioprocess', (currentTime) => this.updatePlaybackHint(currentTime));
  this.waveform.on('pause', () => this.hidePlaybackHint());
  this.waveform.on('finish', () => this.hidePlaybackHint());
  }

  events() {
    this.waveform.once('interaction', () => {
      this.waveform.play();
    })

    this.waveform.on('play', () => {
      this.isPlaying = true;
      this.openSnackBar("Play");
    })

    this.waveform.on('pause', () => {
      this.isPlaying = false;
      this.openSnackBar("Pause");
    })
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

   /* ==================UPDATE CURRENT TIME==================== */
  updatePlaybackHint(currentTime: number) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
        hintElement.textContent = `Tempo: ${formattedTime}`;
        hintElement.style.display = 'block';
    }
}

   /* ==================UPDATE PLAY BACK HINT==================== */
hidePlaybackHint() {
  const hintElement = document.getElementById('playback-hint');
  if (hintElement) {
      hintElement.style.display = 'none';
  }
}

/* ==================AO SELECIONAR O TEXTO==================== */
@HostListener('document:mouseup', ['$event'])
handleMouseUp(event: MouseEvent) {
  const selection = window.getSelection();
  if (selection) {
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      this.openSnackBar(`Texto selecionado: ${selectedText}`);
      this.questionToOpenAI(selectedText); // Chama questionToOpenAI com o texto selecionado
      this.openDialog(selectedText);
      console.log("SELECIONADO:"+selectedText)
    }
  }
}




}//fim
