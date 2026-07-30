import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../core/models/card.model';
import { finalize } from 'rxjs';
import { RouterLink } from "@angular/router";
import { CardVisual } from '../../shared/components/card-visual/card-visual';
import { CurrencyPipe } from '@angular/common';
import { ConfirmDialog } from "../../shared/components/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-card-detail',
  imports: [RouterLink, CardVisual, CurrencyPipe, ConfirmDialog],
  templateUrl: './card-detail.html',
  styleUrl: './card-detail.css',
})
export class CardDetail implements OnInit {
  private cardService = inject(CardService);

  @Input() id!: string;

  card = signal<Card | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  isConfirmOpen = signal(false);
  isUpdating = signal(false);

  toggleButtonLabel = computed(() => {
    return this.card()?.status === 'active' ? 'Kartı blokla' : 'Kartı aktivləşdir';
  });

  ngOnInit() {
    this.cardService.getCardById(this.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (card) => {
        this.card.set(card);
      },
      error: () => {
        this.hasError.set(true);
      }
    })
  }

  onToggleStatusClick() {
    this.isConfirmOpen.set(true);
  }

  onCancelToggle() {
    this.isConfirmOpen.set(false);
  }

  // Optimistic UI - changing ui on the screen wihout waiting for server response
  onConfirmToggle() {
    this.isConfirmOpen.set(false);

    const currentCard = this.card();
    if(!currentCard) return;

    const previousStatus = currentCard.status;
    const newStatus = previousStatus === "active" ? "blocked" : "active";

    this.card.set({...currentCard, status: newStatus});
    this.isUpdating.set(true);

    this.cardService.updateCardStatus(currentCard.id, newStatus).pipe(
      finalize(() => this.isUpdating.set(false))
    ).subscribe({
      next: (updatedCard) => {
        this.card.set(updatedCard);
      },
      error: () => {
        this.card.set({...currentCard, status: previousStatus});
        this.hasError.set(true);
      }
    })
  }
}
