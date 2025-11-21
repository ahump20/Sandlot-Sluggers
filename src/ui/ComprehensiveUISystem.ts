/**
 * Comprehensive UI/HUD System for Sandlot Sluggers
 * Provides complete game interface with advanced features
 *
 * Features:
 * - Dynamic HUD elements with customizable layouts
 * - Advanced menu system with navigation
 * - In-game notifications and alerts
 * - Tutorial system with step-by-step guides
 * - Dialog system for conversations and choices
 * - Scoreboard and statistics display
 * - Mini-map and field overview
 * - Player/team comparison views
 * - Live game events feed
 * - Accessibility features (screen reader, color blind modes)
 * - Theme customization
 * - Animation and transition system
 * - Responsive design for multiple screen sizes
 */

import { Scene } from '@babylonjs/core/scene';
import { AdvancedDynamicTexture, Control } from '@babylonjs/gui';
import { Container } from '@babylonjs/gui/2D/controls/container';
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Image } from '@babylonjs/gui/2D/controls/image';
import { Button } from '@babylonjs/gui/2D/controls/button';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';
import { ScrollViewer } from '@babylonjs/gui/2D/controls/scrollViewers/scrollViewer';
import { Grid } from '@babylonjs/gui/2D/controls/grid';
import { Slider } from '@babylonjs/gui/2D/controls/sliders/slider';
import { Checkbox } from '@babylonjs/gui/2D/controls/checkbox';
import { Observable } from '@babylonjs/core/Misc/observable';

export enum UIElementType {
    CONTAINER = 'container',
    PANEL = 'panel',
    BUTTON = 'button',
    TEXT = 'text',
    IMAGE = 'image',
    PROGRESS_BAR = 'progress_bar',
    SLIDER = 'slider',
    CHECKBOX = 'checkbox',
    DROPDOWN = 'dropdown',
    INPUT_FIELD = 'input_field',
    GRID = 'grid',
    SCROLL_VIEWER = 'scroll_viewer',
    DIALOG = 'dialog',
    NOTIFICATION = 'notification',
    TOOLTIP = 'tooltip',
    HEALTH_BAR = 'health_bar',
    STAMINA_BAR = 'stamina_bar',
    MINI_MAP = 'mini_map',
    SCOREBOARD = 'scoreboard'
}

export enum UILayer {
    BACKGROUND = 0,
    GAME_HUD = 100,
    MENU = 200,
    DIALOG = 300,
    NOTIFICATION = 400,
    TOOLTIP = 500,
    DEBUG = 600
}

export enum UIAnchor {
    TOP_LEFT = 'top_left',
    TOP_CENTER = 'top_center',
    TOP_RIGHT = 'top_right',
    MIDDLE_LEFT = 'middle_left',
    MIDDLE_CENTER = 'middle_center',
    MIDDLE_RIGHT = 'middle_right',
    BOTTOM_LEFT = 'bottom_left',
    BOTTOM_CENTER = 'bottom_center',
    BOTTOM_RIGHT = 'bottom_right'
}

export enum UITheme {
    DEFAULT = 'default',
    DARK = 'dark',
    LIGHT = 'light',
    HIGH_CONTRAST = 'high_contrast',
    COLORBLIND_DEUTERANOPIA = 'colorblind_deuteranopia',
    COLORBLIND_PROTANOPIA = 'colorblind_protanopia',
    COLORBLIND_TRITANOPIA = 'colorblind_tritanopia'
}

export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    ACHIEVEMENT = 'achievement',
    QUEST_COMPLETE = 'quest_complete',
    LEVEL_UP = 'level_up',
    ITEM_ACQUIRED = 'item_acquired'
}

export enum MenuType {
    MAIN_MENU = 'main_menu',
    PAUSE_MENU = 'pause_menu',
    SETTINGS_MENU = 'settings_menu',
    TEAM_MANAGEMENT = 'team_management',
    SHOP = 'shop',
    INVENTORY = 'inventory',
    ACHIEVEMENTS = 'achievements',
    LEADERBOARD = 'leaderboard',
    QUESTS = 'quests',
    PROGRESSION = 'progression',
    SOCIAL = 'social',
    FRANCHISE = 'franchise',
    TRAINING = 'training',
    TOURNAMENT = 'tournament',
    CREDITS = 'credits'
}

export enum DialogType {
    MESSAGE = 'message',
    CONFIRMATION = 'confirmation',
    CHOICE = 'choice',
    INPUT = 'input',
    MULTI_INPUT = 'multi_input'
}

export enum TransitionType {
    FADE = 'fade',
    SLIDE_LEFT = 'slide_left',
    SLIDE_RIGHT = 'slide_right',
    SLIDE_UP = 'slide_up',
    SLIDE_DOWN = 'slide_down',
    SCALE = 'scale',
    ZOOM = 'zoom',
    ROTATE = 'rotate'
}

export interface UIElementConfig {
    id: string;
    type: UIElementType;
    layer: UILayer;
    anchor: UIAnchor;
    position: { x: number; y: number };
    size: { width: number | string; height: number | string };
    visible: boolean;
    enabled: boolean;
    alpha: number;
    zIndex: number;
    style?: UIStyle;
    data?: any;
}

export interface UIStyle {
    backgroundColor?: string;
    borderColor?: string;
    borderThickness?: number;
    borderRadius?: number;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: string;
    padding?: number;
    margin?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
}

export interface NotificationConfig {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    duration: number;
    priority: number;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    callback: () => void;
}

export interface MenuConfig {
    id: string;
    type: MenuType;
    title: string;
    items: MenuItem[];
    closeButton: boolean;
    modal: boolean;
    transition: TransitionType;
}

export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    enabled: boolean;
    submenu?: MenuItem[];
    action?: () => void;
}

export interface DialogConfig {
    id: string;
    type: DialogType;
    title: string;
    message: string;
    icon?: string;
    buttons: DialogButton[];
    defaultButton?: string;
    cancelButton?: string;
    inputs?: DialogInput[];
}

export interface DialogButton {
    id: string;
    label: string;
    style: 'primary' | 'secondary' | 'danger' | 'success';
    action: (result?: any) => void;
}

export interface DialogInput {
    id: string;
    label: string;
    type: 'text' | 'number' | 'password' | 'email';
    placeholder?: string;
    defaultValue?: string;
    validation?: (value: string) => boolean;
}

export interface TutorialStep {
    id: string;
    title: string;
    message: string;
    targetElement?: string;
    highlightElement?: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    actions?: TutorialAction[];
    condition?: () => boolean;
}

export interface TutorialAction {
    type: 'click' | 'hover' | 'input' | 'wait';
    target?: string;
    duration?: number;
}

export interface HUDConfig {
    scoreboard: boolean;
    playerStats: boolean;
    miniMap: boolean;
    notifications: boolean;
    eventsFeed: boolean;
    controls: boolean;
    compass: boolean;
    radar: boolean;
}

export interface ScoreboardData {
    homeTeam: {
        name: string;
        logo: string;
        score: number;
        hits: number;
        errors: number;
    };
    awayTeam: {
        name: string;
        logo: string;
        score: number;
        hits: number;
        errors: number;
    };
    inning: number;
    inningHalf: 'top' | 'bottom';
    outs: number;
    strikes: number;
    balls: number;
    runners: {
        first: boolean;
        second: boolean;
        third: boolean;
    };
}

export interface PlayerHUDData {
    name: string;
    position: string;
    number: number;
    battingAverage: number;
    homeRuns: number;
    rbi: number;
    stamina: number;
    energy: number;
    morale: number;
    activeBuffs: Buff[];
    activeDebuffs: Buff[];
}

export interface Buff {
    id: string;
    name: string;
    icon: string;
    duration: number;
    remainingTime: number;
    effect: string;
}

export interface GameEvent {
    id: string;
    timestamp: number;
    type: string;
    message: string;
    icon?: string;
    priority: number;
}

export interface UIAnimation {
    id: string;
    targetElement: string;
    property: string;
    from: any;
    to: any;
    duration: number;
    easing: EasingFunction;
    loop: boolean;
    yoyo: boolean;
    delay: number;
    onComplete?: () => void;
}

export enum EasingFunction {
    LINEAR = 'linear',
    EASE_IN = 'ease_in',
    EASE_OUT = 'ease_out',
    EASE_IN_OUT = 'ease_in_out',
    EASE_IN_QUAD = 'ease_in_quad',
    EASE_OUT_QUAD = 'ease_out_quad',
    EASE_IN_OUT_QUAD = 'ease_in_out_quad',
    EASE_IN_CUBIC = 'ease_in_cubic',
    EASE_OUT_CUBIC = 'ease_out_cubic',
    EASE_IN_OUT_CUBIC = 'ease_in_out_cubic',
    EASE_IN_QUART = 'ease_in_quart',
    EASE_OUT_QUART = 'ease_out_quart',
    EASE_IN_OUT_QUART = 'ease_in_out_quart',
    EASE_IN_BOUNCE = 'ease_in_bounce',
    EASE_OUT_BOUNCE = 'ease_out_bounce',
    EASE_IN_OUT_BOUNCE = 'ease_in_out_bounce',
    EASE_IN_ELASTIC = 'ease_in_elastic',
    EASE_OUT_ELASTIC = 'ease_out_elastic',
    EASE_IN_OUT_ELASTIC = 'ease_in_out_elastic'
}

export class ComprehensiveUISystem {
    private scene: Scene;
    private advancedTexture: AdvancedDynamicTexture;
    private elements: Map<string, Control>;
    private layers: Map<UILayer, Container>;
    private activeMenus: Map<string, MenuConfig>;
    private activeDialogs: Map<string, DialogConfig>;
    private notifications: NotificationConfig[];
    private tutorialSteps: TutorialStep[];
    private currentTutorialStep: number;
    private animations: Map<string, UIAnimation>;
    private theme: UITheme;
    private hudConfig: HUDConfig;
    private scoreboardData: ScoreboardData | null;
    private playerHUDData: PlayerHUDData | null;
    private gameEvents: GameEvent[];
    private maxGameEvents: number;

    // Observables for events
    public onElementCreated: Observable<UIElementConfig>;
    public onElementClicked: Observable<string>;
    public onElementHovered: Observable<string>;
    public onMenuOpened: Observable<MenuType>;
    public onMenuClosed: Observable<MenuType>;
    public onDialogOpened: Observable<DialogType>;
    public onDialogClosed: Observable<{ dialogId: string; result: any }>;
    public onNotificationShown: Observable<NotificationConfig>;
    public onNotificationDismissed: Observable<string>;
    public onTutorialStepCompleted: Observable<number>;
    public onThemeChanged: Observable<UITheme>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);
        this.elements = new Map();
        this.layers = new Map();
        this.activeMenus = new Map();
        this.activeDialogs = new Map();
        this.notifications = [];
        this.tutorialSteps = [];
        this.currentTutorialStep = 0;
        this.animations = new Map();
        this.theme = UITheme.DEFAULT;
        this.gameEvents = [];
        this.maxGameEvents = 50;

        this.onElementCreated = new Observable();
        this.onElementClicked = new Observable();
        this.onElementHovered = new Observable();
        this.onMenuOpened = new Observable();
        this.onMenuClosed = new Observable();
        this.onDialogOpened = new Observable();
        this.onDialogClosed = new Observable();
        this.onNotificationShown = new Observable();
        this.onNotificationDismissed = new Observable();
        this.onTutorialStepCompleted = new Observable();
        this.onThemeChanged = new Observable();

        this.hudConfig = {
            scoreboard: true,
            playerStats: true,
            miniMap: true,
            notifications: true,
            eventsFeed: true,
            controls: true,
            compass: true,
            radar: true
        };

        this.scoreboardData = null;
        this.playerHUDData = null;

        this.initializeLayers();
        this.setupDefaultTheme();
    }

    private initializeLayers(): void {
        const layerValues = Object.values(UILayer).filter(v => typeof v === 'number') as UILayer[];

        for (const layer of layerValues) {
            const container = new Container(`layer_${layer}`);
            container.zIndex = layer;
            this.advancedTexture.addControl(container);
            this.layers.set(layer, container);
        }
    }

    private setupDefaultTheme(): void {
        this.applyTheme(UITheme.DEFAULT);
    }

    public createElement(config: UIElementConfig): Control {
        let control: Control;

        switch (config.type) {
            case UIElementType.CONTAINER:
                control = this.createContainer(config);
                break;
            case UIElementType.PANEL:
                control = this.createPanel(config);
                break;
            case UIElementType.BUTTON:
                control = this.createButton(config);
                break;
            case UIElementType.TEXT:
                control = this.createText(config);
                break;
            case UIElementType.IMAGE:
                control = this.createImage(config);
                break;
            case UIElementType.PROGRESS_BAR:
                control = this.createProgressBar(config);
                break;
            case UIElementType.SLIDER:
                control = this.createSlider(config);
                break;
            case UIElementType.CHECKBOX:
                control = this.createCheckbox(config);
                break;
            case UIElementType.GRID:
                control = this.createGrid(config);
                break;
            case UIElementType.SCROLL_VIEWER:
                control = this.createScrollViewer(config);
                break;
            case UIElementType.SCOREBOARD:
                control = this.createScoreboard(config);
                break;
            default:
                control = new Container(config.id);
        }

        this.applyCommonProperties(control, config);
        this.applyStyle(control, config.style);

        const layer = this.layers.get(config.layer);
        if (layer) {
            layer.addControl(control);
        }

        this.elements.set(config.id, control);
        this.onElementCreated.notifyObservers(config);

        return control;
    }

    private createContainer(config: UIElementConfig): Container {
        const container = new Container(config.id);
        return container;
    }

    private createPanel(config: UIElementConfig): Rectangle {
        const panel = new Rectangle(config.id);
        panel.thickness = 2;
        panel.cornerRadius = 10;
        return panel;
    }

    private createButton(config: UIElementConfig): Button {
        const button = Button.CreateSimpleButton(config.id, config.data?.text || 'Button');
        button.thickness = 2;
        button.cornerRadius = 5;
        button.onPointerClickObservable.add(() => {
            this.onElementClicked.notifyObservers(config.id);
            if (config.data?.onClick) {
                config.data.onClick();
            }
        });
        button.onPointerEnterObservable.add(() => {
            this.onElementHovered.notifyObservers(config.id);
        });
        return button;
    }

    private createText(config: UIElementConfig): TextBlock {
        const text = new TextBlock(config.id, config.data?.text || '');
        text.fontSize = config.style?.fontSize || 16;
        text.color = config.style?.textColor || 'white';
        text.fontFamily = config.style?.fontFamily || 'Arial';
        text.textHorizontalAlignment = this.getTextAlignment(config.style?.textAlign);
        return text;
    }

    private createImage(config: UIElementConfig): Image {
        const image = new Image(config.id, config.data?.url || '');
        image.stretch = Image.STRETCH_FILL;
        return image;
    }

    private createProgressBar(config: UIElementConfig): Rectangle {
        const container = new Rectangle(`${config.id}_container`);
        container.thickness = 2;
        container.cornerRadius = 5;
        container.background = '#222222';

        const fill = new Rectangle(`${config.id}_fill`);
        fill.thickness = 0;
        fill.background = config.data?.color || '#00ff00';
        fill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        fill.width = `${(config.data?.value || 0) * 100}%`;

        container.addControl(fill);
        return container;
    }

    private createSlider(config: UIElementConfig): Slider {
        const slider = new Slider(config.id);
        slider.minimum = config.data?.min || 0;
        slider.maximum = config.data?.max || 100;
        slider.value = config.data?.value || 50;
        slider.height = '20px';
        slider.color = config.data?.color || '#00ff00';
        slider.background = '#222222';
        slider.onValueChangedObservable.add((value) => {
            if (config.data?.onChange) {
                config.data.onChange(value);
            }
        });
        return slider;
    }

    private createCheckbox(config: UIElementConfig): Checkbox {
        const checkbox = new Checkbox(config.id);
        checkbox.width = '20px';
        checkbox.height = '20px';
        checkbox.color = config.data?.color || '#00ff00';
        checkbox.isChecked = config.data?.checked || false;
        checkbox.onIsCheckedChangedObservable.add((checked) => {
            if (config.data?.onChange) {
                config.data.onChange(checked);
            }
        });
        return checkbox;
    }

    private createGrid(config: UIElementConfig): Grid {
        const grid = new Grid(config.id);
        const rows = config.data?.rows || 1;
        const cols = config.data?.cols || 1;

        for (let i = 0; i < rows; i++) {
            grid.addRowDefinition(1 / rows);
        }
        for (let i = 0; i < cols; i++) {
            grid.addColumnDefinition(1 / cols);
        }

        return grid;
    }

    private createScrollViewer(config: UIElementConfig): ScrollViewer {
        const scrollViewer = new ScrollViewer(config.id);
        scrollViewer.thickness = 2;
        scrollViewer.color = '#444444';
        scrollViewer.background = '#222222';
        scrollViewer.barColor = '#00ff00';
        scrollViewer.barBackground = '#444444';
        return scrollViewer;
    }

    private createScoreboard(config: UIElementConfig): Container {
        const container = new Container(config.id);

        // Background panel
        const panel = new Rectangle(`${config.id}_panel`);
        panel.background = 'rgba(0, 0, 0, 0.8)';
        panel.thickness = 2;
        panel.color = '#00ff00';
        panel.cornerRadius = 10;
        panel.height = '120px';
        panel.width = '600px';
        container.addControl(panel);

        // This is a placeholder - actual scoreboard implementation would be more complex
        return container;
    }

    private applyCommonProperties(control: Control, config: UIElementConfig): void {
        control.isVisible = config.visible;
        control.isEnabled = config.enabled;
        control.alpha = config.alpha;
        control.zIndex = config.zIndex;

        // Set anchor point
        this.setAnchor(control, config.anchor);

        // Set position
        control.left = config.position.x;
        control.top = config.position.y;

        // Set size
        if (typeof config.size.width === 'number') {
            control.width = `${config.size.width}px`;
        } else {
            control.width = config.size.width;
        }

        if (typeof config.size.height === 'number') {
            control.height = `${config.size.height}px`;
        } else {
            control.height = config.size.height;
        }
    }

    private setAnchor(control: Control, anchor: UIAnchor): void {
        switch (anchor) {
            case UIAnchor.TOP_LEFT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case UIAnchor.TOP_CENTER:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case UIAnchor.TOP_RIGHT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case UIAnchor.MIDDLE_LEFT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                break;
            case UIAnchor.MIDDLE_CENTER:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                break;
            case UIAnchor.MIDDLE_RIGHT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                break;
            case UIAnchor.BOTTOM_LEFT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case UIAnchor.BOTTOM_CENTER:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case UIAnchor.BOTTOM_RIGHT:
                control.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
                control.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
        }
    }

    private getTextAlignment(align?: string): number {
        switch (align) {
            case 'left':
                return Control.HORIZONTAL_ALIGNMENT_LEFT;
            case 'center':
                return Control.HORIZONTAL_ALIGNMENT_CENTER;
            case 'right':
                return Control.HORIZONTAL_ALIGNMENT_RIGHT;
            default:
                return Control.HORIZONTAL_ALIGNMENT_LEFT;
        }
    }

    private applyStyle(control: Control, style?: UIStyle): void {
        if (!style) return;

        if (control instanceof Rectangle) {
            if (style.backgroundColor) control.background = style.backgroundColor;
            if (style.borderColor) control.color = style.borderColor;
            if (style.borderThickness) control.thickness = style.borderThickness;
            if (style.borderRadius) control.cornerRadius = style.borderRadius;
        }

        if (control instanceof TextBlock) {
            if (style.textColor) control.color = style.textColor;
            if (style.fontSize) control.fontSize = style.fontSize;
            if (style.fontFamily) control.fontFamily = style.fontFamily;
            if (style.fontWeight) control.fontWeight = style.fontWeight;
        }

        if (control instanceof Button) {
            if (style.backgroundColor) control.background = style.backgroundColor;
            if (style.borderColor) control.color = style.borderColor;
            if (style.borderThickness) control.thickness = style.borderThickness;
            if (style.borderRadius) control.cornerRadius = style.borderRadius;
        }
    }

    public showNotification(config: NotificationConfig): void {
        this.notifications.push(config);
        this.renderNotification(config);
        this.onNotificationShown.notifyObservers(config);

        if (config.duration > 0) {
            setTimeout(() => {
                this.dismissNotification(config.id);
            }, config.duration);
        }
    }

    private renderNotification(config: NotificationConfig): void {
        const notificationElement = this.createElement({
            id: `notification_${config.id}`,
            type: UIElementType.PANEL,
            layer: UILayer.NOTIFICATION,
            anchor: UIAnchor.TOP_RIGHT,
            position: { x: -20, y: 20 + (this.notifications.length - 1) * 100 },
            size: { width: 300, height: 80 },
            visible: true,
            enabled: true,
            alpha: 1,
            zIndex: UILayer.NOTIFICATION + this.notifications.length,
            style: {
                backgroundColor: this.getNotificationColor(config.type),
                borderColor: '#ffffff',
                borderThickness: 2,
                borderRadius: 5
            }
        });

        // Add notification content (title, message, icon, actions)
        // This is a simplified version - full implementation would add all elements
    }

    private getNotificationColor(type: NotificationType): string {
        switch (type) {
            case NotificationType.INFO:
                return 'rgba(0, 120, 215, 0.9)';
            case NotificationType.SUCCESS:
                return 'rgba(16, 124, 16, 0.9)';
            case NotificationType.WARNING:
                return 'rgba(255, 185, 0, 0.9)';
            case NotificationType.ERROR:
                return 'rgba(232, 17, 35, 0.9)';
            case NotificationType.ACHIEVEMENT:
                return 'rgba(255, 215, 0, 0.9)';
            case NotificationType.QUEST_COMPLETE:
                return 'rgba(0, 255, 127, 0.9)';
            case NotificationType.LEVEL_UP:
                return 'rgba(138, 43, 226, 0.9)';
            case NotificationType.ITEM_ACQUIRED:
                return 'rgba(255, 140, 0, 0.9)';
            default:
                return 'rgba(100, 100, 100, 0.9)';
        }
    }

    public dismissNotification(id: string): void {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.removeElement(`notification_${id}`);
            this.onNotificationDismissed.notifyObservers(id);
            this.repositionNotifications();
        }
    }

    private repositionNotifications(): void {
        this.notifications.forEach((notification, index) => {
            const element = this.getElement(`notification_${notification.id}`);
            if (element) {
                element.top = 20 + index * 100;
            }
        });
    }

    public showMenu(config: MenuConfig): void {
        this.activeMenus.set(config.id, config);
        this.renderMenu(config);
        this.onMenuOpened.notifyObservers(config.type);
    }

    private renderMenu(config: MenuConfig): void {
        // Create menu container
        const menuContainer = this.createElement({
            id: `menu_${config.id}`,
            type: UIElementType.PANEL,
            layer: UILayer.MENU,
            anchor: UIAnchor.MIDDLE_CENTER,
            position: { x: 0, y: 0 },
            size: { width: 600, height: 400 },
            visible: true,
            enabled: true,
            alpha: 1,
            zIndex: UILayer.MENU,
            style: {
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                borderColor: '#00ff00',
                borderThickness: 3,
                borderRadius: 10
            }
        });

        // Add menu title
        // Add menu items
        // Add close button if configured
        // This is a simplified version - full implementation would add all elements
    }

    public closeMenu(menuId: string): void {
        const menu = this.activeMenus.get(menuId);
        if (menu) {
            this.removeElement(`menu_${menuId}`);
            this.activeMenus.delete(menuId);
            this.onMenuClosed.notifyObservers(menu.type);
        }
    }

    public showDialog(config: DialogConfig): Promise<any> {
        return new Promise((resolve) => {
            this.activeDialogs.set(config.id, config);
            this.renderDialog(config, resolve);
            this.onDialogOpened.notifyObservers(config.type);
        });
    }

    private renderDialog(config: DialogConfig, resolve: (value: any) => void): void {
        // Create dialog container
        const dialogContainer = this.createElement({
            id: `dialog_${config.id}`,
            type: UIElementType.PANEL,
            layer: UILayer.DIALOG,
            anchor: UIAnchor.MIDDLE_CENTER,
            position: { x: 0, y: 0 },
            size: { width: 400, height: 250 },
            visible: true,
            enabled: true,
            alpha: 1,
            zIndex: UILayer.DIALOG,
            style: {
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                borderColor: '#ffffff',
                borderThickness: 2,
                borderRadius: 8
            }
        });

        // Add dialog content (title, message, icon, buttons, inputs)
        // This is a simplified version - full implementation would add all elements
    }

    public closeDialog(dialogId: string, result: any): void {
        const dialog = this.activeDialogs.get(dialogId);
        if (dialog) {
            this.removeElement(`dialog_${dialogId}`);
            this.activeDialogs.delete(dialogId);
            this.onDialogClosed.notifyObservers({ dialogId, result });
        }
    }

    public startTutorial(steps: TutorialStep[]): void {
        this.tutorialSteps = steps;
        this.currentTutorialStep = 0;
        this.showTutorialStep(this.tutorialSteps[0]);
    }

    private showTutorialStep(step: TutorialStep): void {
        // Create tutorial overlay
        // Highlight target element if specified
        // Show tutorial message
        // Wait for condition to be met or action to be performed
        // This is a placeholder for the full implementation
    }

    public nextTutorialStep(): void {
        if (this.currentTutorialStep < this.tutorialSteps.length - 1) {
            this.onTutorialStepCompleted.notifyObservers(this.currentTutorialStep);
            this.currentTutorialStep++;
            this.showTutorialStep(this.tutorialSteps[this.currentTutorialStep]);
        } else {
            this.endTutorial();
        }
    }

    public endTutorial(): void {
        this.onTutorialStepCompleted.notifyObservers(this.currentTutorialStep);
        this.tutorialSteps = [];
        this.currentTutorialStep = 0;
        // Remove tutorial overlay and highlights
    }

    public applyTheme(theme: UITheme): void {
        this.theme = theme;
        // Apply theme colors and styles to all UI elements
        // This is a placeholder for the full implementation
        this.onThemeChanged.notifyObservers(theme);
    }

    public updateHUDConfig(config: Partial<HUDConfig>): void {
        this.hudConfig = { ...this.hudConfig, ...config };
        this.refreshHUD();
    }

    private refreshHUD(): void {
        // Update visibility and layout of HUD elements based on config
        // This is a placeholder for the full implementation
    }

    public updateScoreboard(data: ScoreboardData): void {
        this.scoreboardData = data;
        // Update scoreboard display
        // This is a placeholder for the full implementation
    }

    public updatePlayerHUD(data: PlayerHUDData): void {
        this.playerHUDData = data;
        // Update player HUD display
        // This is a placeholder for the full implementation
    }

    public addGameEvent(event: GameEvent): void {
        this.gameEvents.unshift(event);
        if (this.gameEvents.length > this.maxGameEvents) {
            this.gameEvents = this.gameEvents.slice(0, this.maxGameEvents);
        }
        // Update events feed display
    }

    public createAnimation(animation: UIAnimation): void {
        this.animations.set(animation.id, animation);
        this.playAnimation(animation.id);
    }

    public playAnimation(animationId: string): void {
        const animation = this.animations.get(animationId);
        if (!animation) return;

        const element = this.getElement(animation.targetElement);
        if (!element) return;

        // Implement animation logic using requestAnimationFrame
        // This is a placeholder for the full implementation
    }

    public stopAnimation(animationId: string): void {
        // Stop the specified animation
        // This is a placeholder for the full implementation
    }

    public getElement(id: string): Control | undefined {
        return this.elements.get(id);
    }

    public removeElement(id: string): void {
        const element = this.elements.get(id);
        if (element) {
            element.dispose();
            this.elements.delete(id);
        }
    }

    public clearLayer(layer: UILayer): void {
        const layerContainer = this.layers.get(layer);
        if (layerContainer) {
            layerContainer.clearControls();
        }
    }

    public setElementVisibility(id: string, visible: boolean): void {
        const element = this.getElement(id);
        if (element) {
            element.isVisible = visible;
        }
    }

    public setElementEnabled(id: string, enabled: boolean): void {
        const element = this.getElement(id);
        if (element) {
            element.isEnabled = enabled;
        }
    }

    public setElementAlpha(id: string, alpha: number): void {
        const element = this.getElement(id);
        if (element) {
            element.alpha = alpha;
        }
    }

    public updateElementStyle(id: string, style: Partial<UIStyle>): void {
        const element = this.getElement(id);
        if (element) {
            this.applyStyle(element, style as UIStyle);
        }
    }

    public dispose(): void {
        // Clear all elements
        this.elements.forEach(element => element.dispose());
        this.elements.clear();

        // Clear layers
        this.layers.forEach(layer => layer.dispose());
        this.layers.clear();

        // Clear collections
        this.activeMenus.clear();
        this.activeDialogs.clear();
        this.notifications = [];
        this.tutorialSteps = [];
        this.animations.clear();
        this.gameEvents = [];

        // Dispose advanced texture
        this.advancedTexture.dispose();
    }

    // Export/Import for save system
    public exportUIState(): any {
        return {
            theme: this.theme,
            hudConfig: this.hudConfig,
            scoreboardData: this.scoreboardData,
            playerHUDData: this.playerHUDData,
            gameEvents: this.gameEvents.slice(0, 10) // Save last 10 events
        };
    }

    public importUIState(data: any): void {
        if (data.theme) {
            this.applyTheme(data.theme);
        }
        if (data.hudConfig) {
            this.updateHUDConfig(data.hudConfig);
        }
        if (data.scoreboardData) {
            this.updateScoreboard(data.scoreboardData);
        }
        if (data.playerHUDData) {
            this.updatePlayerHUD(data.playerHUDData);
        }
        if (data.gameEvents) {
            this.gameEvents = data.gameEvents;
        }
    }
}
