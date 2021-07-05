import {
    Directive,
    ElementRef,
    OnInit,
    TemplateRef,
    Input,
    HostListener,
    ViewContainerRef,
    OnDestroy,
    AfterViewInit, Output, EventEmitter,
} from '@angular/core';
import {
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { POSITION_MAP } from './conection-positon-pair';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { OrdOverlayContentComponent } from './ord-overlay-content/ord-menu.component';

@Directive({
    selector: '[ordOverlayTringger]',
})
export class OrdOverlayTringgerDirective implements OnInit, OnDestroy, AfterViewInit {
    @Input() ordOverlayTringger: OrdOverlayContentComponent;
    @Input() menupositons: 'rightTop' | 'top' | 'bottomLeft' | 'rightBottom' = 'bottomLeft';
    @Input() triggerBy: 'click' | 'hover' | null = 'click';
    @Input() hasBackdrop: boolean;
    @Input() minWidth = '200px';
    @Output() onOverlayOpen = new EventEmitter();
    @Output() onOverlayClose = new EventEmitter();
    overlayRef: OverlayRef;
    $destroy = new Subject<boolean>();
    private menuState: 'open' | 'close' = 'close';
    private portal: TemplatePortal;

    private get positons(): ConnectionPositionPair[] {
        return [
            POSITION_MAP[this.menupositons],
            POSITION_MAP.top,
            POSITION_MAP.rightTop,
            POSITION_MAP.bottomLeft,
            POSITION_MAP.rightBottom,
        ];
    }

    private subcription = Subscription.EMPTY;
    private readonly hover$ = new Subject<boolean>();
    private readonly click$ = new Subject<boolean>();

    constructor(private el: ElementRef,
                private overlay: Overlay,
                private  vcr: ViewContainerRef,
    ) {
    }


    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.initialize();
    }

    ngOnDestroy(): void {
        this.closeMenu();
        this.subcription.unsubscribe();
    }


    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.ordOverlayTringger) {
            // this.openMenu();
            this.click$.next(true);
        }
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter() {
        this.hover$.next(true);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave() {
        this.hover$.next(false);
    }

    openMenu() {
        if (this.menuState === 'open') {
            return;
        }
        const overlayConfig = this.getOverlayConfig();
        this.setOverayPosition(overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy);
        const overlayRef = this.overlay.create(overlayConfig);
        // console.log(overlayRef);
        overlayRef.attach(this.getPortal());
        this.subcribeOvelayEven(overlayRef);
        this.overlayRef = overlayRef;
        this.menuState = 'open';
        this.onOverlayOpen.emit();
    }

    closeMenu() {
        if (this.menuState === 'open') {
            this.overlayRef?.detach();
            this.menuState = 'close';
            this.onOverlayClose.emit();
        }
    }

    private initialize() {
        const hover$ = merge(this.ordOverlayTringger.visiable$, this.hover$).pipe(debounceTime(100));
        const handle$ = this.triggerBy === 'hover' ? hover$ : this.click$;
        handle$.subscribe(result => {
            if (result) {
                this.openMenu();
                return;
            }
            this.closeMenu();
        });
    }


    private getOverlayConfig(): OverlayConfig {
        // console.log(' POSITION_MAP.rightTop', POSITION_MAP.rightTop);
        const positionStrategy = this.overlay.position().flexibleConnectedTo(this.el);
        return new OverlayConfig({
            positionStrategy: positionStrategy,
            minWidth: this.minWidth,
            hasBackdrop: this.hasBackdrop === undefined ? (this.triggerBy !== 'hover') : this.hasBackdrop,
            backdropClass: 'ord-menu-backdrop',
            panelClass: 'ord-menu-panel',
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
        });
    }

    private setOverayPosition(pos: FlexibleConnectedPositionStrategy) {
        pos.withPositions([...this.positons]);

    }

    private getPortal(): TemplatePortal {
        if (!this.portal || this.portal.templateRef !== this.ordOverlayTringger.contentTemplate) {
            this.portal = new TemplatePortal<any>(this.ordOverlayTringger.contentTemplate, this.vcr);
        }
        return this.portal;

    }

    private subcribeOvelayEven(overlayRef: OverlayRef) {
        this.subcription.unsubscribe();
        this.subcription = merge(
            overlayRef.backdropClick(),
            overlayRef.detachments(),
            overlayRef.keydownEvents().pipe(filter(event => event.keyCode === ESCAPE && !hasModifierKey(event))),
        ).subscribe(() => {
            this.closeMenu();
        });
    }
}
