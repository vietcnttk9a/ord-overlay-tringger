import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'ord-overlay-content',
    templateUrl: './ord-menu.component.html',
    styleUrls: ['./ord-menu.component.css'],
})
export class OrdOverlayContentComponent implements OnInit {
    public readonly visiable$ = new Subject<boolean>();
    @ViewChild(TemplateRef, { static: true }) contentTemplate: TemplateRef<any>;

    constructor() {
    }

    ngOnInit(): void {
    }

}
