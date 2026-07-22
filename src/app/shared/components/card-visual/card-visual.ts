import { Component, Input } from '@angular/core';
import { Card } from '../../../core/models/card.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-card-visual',
  imports: [CurrencyPipe],
  templateUrl: './card-visual.html',
  styleUrl: './card-visual.css',
})
export class CardVisual {
  @Input({required: true}) card!: Card
}
