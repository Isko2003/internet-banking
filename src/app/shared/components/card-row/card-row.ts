import { Component, Input } from '@angular/core';
import { Card } from '../../../core/models/card.model';

@Component({
  selector: 'app-card-row',
  imports: [],
  templateUrl: './card-row.html',
  styleUrl: './card-row.css',
})
export class CardRow {
    @Input({ required: true }) card!: Card;
}
