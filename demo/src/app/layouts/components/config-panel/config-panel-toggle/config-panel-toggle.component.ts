import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { scaleInOutAnimation } from '@vex/animations/scale-in-out.animation';
import { ShareBottomSheetComponent } from '../../../../pages/dashboards/components/share-bottom-sheet/share-bottom-sheet.component';

@Component({
  selector: 'vex-config-panel-toggle',
  templateUrl: './config-panel-toggle.component.html',
  styleUrls: ['./config-panel-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleInOutAnimation],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatBottomSheetModule,]
})
export class ConfigPanelToggleComponent {
  @Output() openConfig = new EventEmitter();
  @Output() openBottomConfig = new EventEmitter(); // Novo evento para o painel inferior

  showButton: boolean = false;
  result?: string;

  constructor(private _bottomSheet: MatBottomSheet, dialog: MatDialog) {}

  openBothConfigs() {
    this.openConfig.emit();
    this.openBottomConfig.emit();
  }
  openBothConfigs2() {
    this._bottomSheet.open(ShareBottomSheetComponent);
  }
}
