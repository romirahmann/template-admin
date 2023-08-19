import { Component, OnInit } from '@angular/core';

import { EventService } from '../core/services/event.service';
import {
  LAYOUT_VERTICAL
} from './layout.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})

/**
 * Layout Component
 */
export class LayoutComponent implements OnInit {

  layoutType!: string;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.layoutType = LAYOUT_VERTICAL;

    document.body.setAttribute('layout',this.layoutType)

     // listen to event and change the layout, theme, etc
     this.eventService.subscribe('changeLayout', (layout) => {
      this.layoutType = layout;
    });
    
  }

  /**
  * Check if the vertical layout is requested
  */
   isVerticalLayoutRequested() {
    return this.layoutType === LAYOUT_VERTICAL;
  }
}
