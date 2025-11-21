/**
 * Advanced UI System
 *
 * Comprehensive UI framework with responsive layouts, animations, themes,
 * accessibility, input handling, tooltips, modals, notifications, menus,
 * drag-and-drop, virtual scrolling, and component lifecycle management.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * UI Component base interface
 */
export interface UIComponent {
  id: string;
  type: UIComponentType;
  parent: UIComponent | null;
  children: UIComponent[];

  // Layout
  position: { x: number; y: number };
  size: { width: number; height: number };
  anchor: AnchorPoint;
  pivot: { x: number; y: number }; // 0-1 normalized
  rotation: number; // degrees
  scale: { x: number; y: number };

  // Visibility
  visible: boolean;
  opacity: number; // 0-1
  zIndex: number;

  // Styling
  style: UIStyle;
  hoverStyle?: UIStyle;
  activeStyle?: UIStyle;
  disabledStyle?: UIStyle;

  // State
  enabled: boolean;
  focused: boolean;
  hovered: boolean;
  pressed: boolean;

  // Animation
  animations: UIAnimation[];
  transitions: UITransition[];

  // Events
  events: Map<UIEventType, UIEventHandler[]>;

  // Metadata
  tag: string;
  data: Map<string, any>;
  tooltip?: UITooltip;
}

/**
 * Component types
 */
export type UIComponentType =
  | 'container'
  | 'panel'
  | 'button'
  | 'text'
  | 'image'
  | 'input'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'slider'
  | 'dropdown'
  | 'list'
  | 'grid'
  | 'scrollview'
  | 'tab'
  | 'modal'
  | 'tooltip'
  | 'progress_bar'
  | 'health_bar'
  | 'notification'
  | 'menu'
  | 'context_menu'
  | 'draggable'
  | 'canvas'
  | 'video';

/**
 * Anchor points for positioning
 */
export type AnchorPoint =
  | 'top_left'
  | 'top_center'
  | 'top_right'
  | 'middle_left'
  | 'middle_center'
  | 'middle_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'bottom_right';

/**
 * UI Style configuration
 */
export interface UIStyle {
  // Colors
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  shadowColor?: string;

  // Borders
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Spacing
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };

  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;

  // Effects
  boxShadow?: string;
  textShadow?: string;
  filter?: string;
  backdropFilter?: string;

  // Layout
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Cursor
  cursor?: 'default' | 'pointer' | 'text' | 'move' | 'not-allowed' | 'grab' | 'grabbing';

  // Custom properties
  custom?: Map<string, any>;
}

/**
 * UI Animation
 */
export interface UIAnimation {
  id: string;
  property: string; // 'opacity', 'position', 'scale', etc.
  from: any;
  to: any;
  duration: number; // seconds
  delay: number; // seconds
  easing: EasingFunction;
  loop: boolean;
  pingpong: boolean;
  onComplete?: () => void;

  // State
  isPlaying: boolean;
  currentTime: number;
  progress: number; // 0-1
}

/**
 * UI Transition
 */
export interface UITransition {
  property: string;
  duration: number; // seconds
  easing: EasingFunction;
  delay: number;
}

/**
 * Easing functions
 */
export type EasingFunction =
  | 'linear'
  | 'ease_in'
  | 'ease_out'
  | 'ease_in_out'
  | 'ease_in_quad'
  | 'ease_out_quad'
  | 'ease_in_out_quad'
  | 'ease_in_cubic'
  | 'ease_out_cubic'
  | 'ease_in_out_cubic'
  | 'ease_in_quart'
  | 'ease_out_quart'
  | 'ease_in_out_quart'
  | 'bounce'
  | 'elastic';

/**
 * UI Events
 */
export type UIEventType =
  | 'click'
  | 'double_click'
  | 'mouse_down'
  | 'mouse_up'
  | 'mouse_enter'
  | 'mouse_leave'
  | 'mouse_move'
  | 'mouse_wheel'
  | 'key_down'
  | 'key_up'
  | 'key_press'
  | 'focus'
  | 'blur'
  | 'change'
  | 'input'
  | 'submit'
  | 'drag_start'
  | 'drag'
  | 'drag_end'
  | 'drop'
  | 'touch_start'
  | 'touch_move'
  | 'touch_end';

/**
 * Event handler
 */
export type UIEventHandler = (event: UIEvent) => void;

/**
 * UI Event data
 */
export interface UIEvent {
  type: UIEventType;
  target: UIComponent;
  currentTarget: UIComponent;
  timestamp: number;

  // Mouse data
  mousePosition?: { x: number; y: number };
  mouseButton?: number;
  mouseWheel?: number;

  // Keyboard data
  key?: string;
  keyCode?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;

  // Touch data
  touches?: Array<{ x: number; y: number; id: number }>;

  // Drag data
  dragData?: any;

  // Propagation
  stopPropagation: () => void;
  preventDefault: () => void;
  isPropagationStopped: boolean;
  isDefaultPrevented: boolean;
}

/**
 * Button component
 */
export interface UIButton extends UIComponent {
  type: 'button';
  text: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  disabled: boolean;
  onClick: UIEventHandler;
}

/**
 * Text component
 */
export interface UIText extends UIComponent {
  type: 'text';
  text: string;
  wordWrap: boolean;
  maxWidth?: number;
  maxHeight?: number;
  ellipsis: boolean; // Add "..." if text is too long
}

/**
 * Image component
 */
export interface UIImage extends UIComponent {
  type: 'image';
  src: string;
  alt: string;
  fit: 'contain' | 'cover' | 'fill' | 'scale-down';
  loading: 'lazy' | 'eager';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

/**
 * Input component
 */
export interface UIInput extends UIComponent {
  type: 'input';
  value: string;
  placeholder: string;
  inputType: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  maxLength?: number;
  pattern?: string;
  required: boolean;
  readonly: boolean;
  autocomplete?: string;
  onInput: UIEventHandler;
  onChange: UIEventHandler;
}

/**
 * Slider component
 */
export interface UISlider extends UIComponent {
  type: 'slider';
  value: number;
  min: number;
  max: number;
  step: number;
  showValue: boolean;
  orientation: 'horizontal' | 'vertical';
  onChange: UIEventHandler;
}

/**
 * Progress bar component
 */
export interface UIProgressBar extends UIComponent {
  type: 'progress_bar';
  value: number; // 0-100
  showPercentage: boolean;
  color: string;
  backgroundColor: string;
  animated: boolean;
}

/**
 * Modal dialog
 */
export interface UIModal extends UIComponent {
  type: 'modal';
  title: string;
  content: UIComponent[];
  footer?: UIComponent[];
  closeButton: boolean;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
  backdrop: boolean;
  backdropColor: string;
  onClose: UIEventHandler;
}

/**
 * Notification
 */
export interface UINotification extends UIComponent {
  type: 'notification';
  message: string;
  notificationType: 'info' | 'success' | 'warning' | 'error';
  duration: number; // seconds (0 = persistent)
  showCloseButton: boolean;
  icon?: string;
  onClose: UIEventHandler;
}

/**
 * Tooltip
 */
export interface UITooltip {
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  delay: number; // ms
  maxWidth: number;
  style?: UIStyle;
}

/**
 * Menu component
 */
export interface UIMenu extends UIComponent {
  type: 'menu';
  items: UIMenuItem[];
  orientation: 'horizontal' | 'vertical';
  openOnHover: boolean;
}

/**
 * Menu item
 */
export interface UIMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled: boolean;
  separator: boolean;
  submenu?: UIMenuItem[];
  onClick: UIEventHandler;
}

/**
 * List component
 */
export interface UIList extends UIComponent {
  type: 'list';
  items: any[];
  itemRenderer: (item: any, index: number) => UIComponent;
  selectedIndex: number;
  multiSelect: boolean;
  virtualScrolling: boolean;
  itemHeight?: number; // For virtual scrolling
  onSelectionChange: UIEventHandler;
}

/**
 * Grid component
 */
export interface UIGrid extends UIComponent {
  type: 'grid';
  items: any[];
  columns: number;
  gap: number;
  itemRenderer: (item: any, index: number) => UIComponent;
}

/**
 * Tab container
 */
export interface UITabContainer extends UIComponent {
  tabs: UITab[];
  activeTabIndex: number;
  onTabChange: UIEventHandler;
}

/**
 * Tab
 */
export interface UITab {
  id: string;
  label: string;
  icon?: string;
  content: UIComponent[];
  disabled: boolean;
  closeable: boolean;
}

/**
 * Draggable component
 */
export interface UIDraggable extends UIComponent {
  type: 'draggable';
  dragData: any;
  dragHandle?: UIComponent;
  constrainToParent: boolean;
  onDragStart: UIEventHandler;
  onDrag: UIEventHandler;
  onDragEnd: UIEventHandler;
}

/**
 * Drop target
 */
export interface UIDropTarget extends UIComponent {
  acceptTypes: string[];
  onDrop: UIEventHandler;
  onDragOver: UIEventHandler;
  onDragLeave: UIEventHandler;
}

/**
 * Theme configuration
 */
export interface UITheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    disabled: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    fontWeight: {
      light: number;
      normal: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * Layout manager
 */
export interface LayoutManager {
  type: 'flex' | 'grid' | 'absolute' | 'stack';
  calculate(container: UIComponent): void;
}

/**
 * Responsive breakpoints
 */
export interface ResponsiveConfig {
  breakpoints: {
    xs: number; // < 576px
    sm: number; // >= 576px
    md: number; // >= 768px
    lg: number; // >= 1024px
    xl: number; // >= 1280px
    xxl: number; // >= 1536px
  };
  currentBreakpoint: string;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  enabled: boolean;
  announceChanges: boolean;
  keyboardNavigation: boolean;
  focusOutline: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderSupport: boolean;
}

// ============================================================================
// Advanced UI System Class
// ============================================================================

export class AdvancedUISystem {
  private components: Map<string, UIComponent>;
  private rootComponents: UIComponent[];
  private focusedComponent: UIComponent | null;
  private hoveredComponent: UIComponent | null;
  private draggedComponent: UIComponent | null;

  // Rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private needsRedraw: boolean;

  // Theme
  private currentTheme: UITheme;
  private themes: Map<string, UITheme>;

  // Layout
  private responsive: ResponsiveConfig;
  private layoutManagers: Map<string, LayoutManager>;

  // Accessibility
  private accessibility: AccessibilityConfig;

  // Modal stack
  private modalStack: UIModal[];

  // Notification queue
  private notifications: UINotification[];

  // Event system
  private eventQueue: UIEvent[];

  // Animation
  private activeAnimations: UIAnimation[];
  private lastFrameTime: number;

  // Performance
  private readonly MAX_COMPONENTS = 10000;
  private readonly MAX_DRAW_CALLS = 5000;
  private drawCallCount: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    this.components = new Map();
    this.rootComponents = [];
    this.focusedComponent = null;
    this.hoveredComponent = null;
    this.draggedComponent = null;
    this.needsRedraw = true;
    this.themes = new Map();
    this.modalStack = [];
    this.notifications = [];
    this.eventQueue = [];
    this.activeAnimations = [];
    this.lastFrameTime = 0;
    this.drawCallCount = 0;
    this.layoutManagers = new Map();

    this.responsive = {
      breakpoints: {
        xs: 576,
        sm: 576,
        md: 768,
        lg: 1024,
        xl: 1280,
        xxl: 1536
      },
      currentBreakpoint: 'lg'
    };

    this.accessibility = {
      enabled: true,
      announceChanges: true,
      keyboardNavigation: true,
      focusOutline: true,
      highContrast: false,
      reducedMotion: false,
      screenReaderSupport: true
    };

    this.currentTheme = this.createDefaultTheme();
    this.themes.set('default', this.currentTheme);

    this.initialize();
  }

  // ========================================================================
  // Public API - Initialization
  // ========================================================================

  /**
   * Initialize the UI system
   */
  public initialize(): void {
    this.setupEventListeners();
    this.updateResponsiveBreakpoint();
    this.initializeLayoutManagers();
  }

  /**
   * Shutdown the UI system
   */
  public shutdown(): void {
    this.removeEventListeners();
    this.components.clear();
    this.rootComponents = [];
  }

  // ========================================================================
  // Public API - Component Creation
  // ========================================================================

  /**
   * Create a component
   */
  public createComponent(type: UIComponentType, config?: Partial<UIComponent>): UIComponent {
    const component: UIComponent = {
      id: this.generateId(),
      type,
      parent: null,
      children: [],
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      anchor: 'top_left',
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      visible: true,
      opacity: 1.0,
      zIndex: 0,
      style: this.createDefaultStyle(),
      enabled: true,
      focused: false,
      hovered: false,
      pressed: false,
      animations: [],
      transitions: [],
      events: new Map(),
      tag: '',
      data: new Map(),
      ...config
    };

    this.components.set(component.id, component);
    this.needsRedraw = true;

    return component;
  }

  /**
   * Create a button
   */
  public createButton(text: string, onClick: UIEventHandler, config?: Partial<UIButton>): UIButton {
    const button = this.createComponent('button', config) as UIButton;
    button.text = text;
    button.onClick = onClick;
    button.disabled = config?.disabled || false;

    this.addEventListener(button, 'click', onClick);

    return button;
  }

  /**
   * Create a text component
   */
  public createText(text: string, config?: Partial<UIText>): UIText {
    const textComponent = this.createComponent('text', config) as UIText;
    textComponent.text = text;
    textComponent.wordWrap = config?.wordWrap !== undefined ? config.wordWrap : true;
    textComponent.ellipsis = config?.ellipsis !== undefined ? config.ellipsis : true;

    return textComponent;
  }

  /**
   * Create an image
   */
  public createImage(src: string, config?: Partial<UIImage>): UIImage {
    const image = this.createComponent('image', config) as UIImage;
    image.src = src;
    image.alt = config?.alt || '';
    image.fit = config?.fit || 'contain';
    image.loading = config?.loading || 'lazy';

    return image;
  }

  /**
   * Create an input field
   */
  public createInput(placeholder: string, config?: Partial<UIInput>): UIInput {
    const input = this.createComponent('input', config) as UIInput;
    input.value = config?.value || '';
    input.placeholder = placeholder;
    input.inputType = config?.inputType || 'text';
    input.required = config?.required || false;
    input.readonly = config?.readonly || false;

    input.onInput = config?.onInput || (() => {});
    input.onChange = config?.onChange || (() => {});

    return input;
  }

  /**
   * Create a slider
   */
  public createSlider(min: number, max: number, value: number, config?: Partial<UISlider>): UISlider {
    const slider = this.createComponent('slider', config) as UISlider;
    slider.value = value;
    slider.min = min;
    slider.max = max;
    slider.step = config?.step || 1;
    slider.showValue = config?.showValue !== undefined ? config.showValue : true;
    slider.orientation = config?.orientation || 'horizontal';
    slider.onChange = config?.onChange || (() => {});

    return slider;
  }

  /**
   * Create a progress bar
   */
  public createProgressBar(value: number, config?: Partial<UIProgressBar>): UIProgressBar {
    const progressBar = this.createComponent('progress_bar', config) as UIProgressBar;
    progressBar.value = Math.max(0, Math.min(100, value));
    progressBar.showPercentage = config?.showPercentage !== undefined ? config.showPercentage : true;
    progressBar.color = config?.color || this.currentTheme.colors.primary;
    progressBar.backgroundColor = config?.backgroundColor || this.currentTheme.colors.surface;
    progressBar.animated = config?.animated !== undefined ? config.animated : true;

    return progressBar;
  }

  /**
   * Create a modal
   */
  public createModal(title: string, content: UIComponent[], config?: Partial<UIModal>): UIModal {
    const modal = this.createComponent('modal', config) as UIModal;
    modal.title = title;
    modal.content = content;
    modal.footer = config?.footer || [];
    modal.closeButton = config?.closeButton !== undefined ? config.closeButton : true;
    modal.closeOnBackdrop = config?.closeOnBackdrop !== undefined ? config.closeOnBackdrop : true;
    modal.closeOnEscape = config?.closeOnEscape !== undefined ? config.closeOnEscape : true;
    modal.backdrop = config?.backdrop !== undefined ? config.backdrop : true;
    modal.backdropColor = config?.backdropColor || 'rgba(0, 0, 0, 0.5)';
    modal.onClose = config?.onClose || (() => {});

    // Set modal properties
    modal.anchor = 'middle_center';
    modal.size = { width: 400, height: 300 };

    return modal;
  }

  /**
   * Create a notification
   */
  public createNotification(
    message: string,
    type: UINotification['notificationType'],
    config?: Partial<UINotification>
  ): UINotification {
    const notification = this.createComponent('notification', config) as UINotification;
    notification.message = message;
    notification.notificationType = type;
    notification.duration = config?.duration !== undefined ? config.duration : 3;
    notification.showCloseButton = config?.showCloseButton !== undefined ? config.showCloseButton : true;
    notification.icon = config?.icon;
    notification.onClose = config?.onClose || (() => {});

    // Position at top-right
    notification.anchor = 'top_right';
    notification.position = { x: -20, y: 20 };
    notification.size = { width: 300, height: 80 };

    return notification;
  }

  /**
   * Create a menu
   */
  public createMenu(items: UIMenuItem[], config?: Partial<UIMenu>): UIMenu {
    const menu = this.createComponent('menu', config) as UIMenu;
    menu.items = items;
    menu.orientation = config?.orientation || 'vertical';
    menu.openOnHover = config?.openOnHover !== undefined ? config.openOnHover : false;

    return menu;
  }

  /**
   * Create a list
   */
  public createList(
    items: any[],
    itemRenderer: (item: any, index: number) => UIComponent,
    config?: Partial<UIList>
  ): UIList {
    const list = this.createComponent('list', config) as UIList;
    list.items = items;
    list.itemRenderer = itemRenderer;
    list.selectedIndex = config?.selectedIndex !== undefined ? config.selectedIndex : -1;
    list.multiSelect = config?.multiSelect || false;
    list.virtualScrolling = config?.virtualScrolling || false;
    list.itemHeight = config?.itemHeight;
    list.onSelectionChange = config?.onSelectionChange || (() => {});

    return list;
  }

  /**
   * Create a grid
   */
  public createGrid(
    items: any[],
    columns: number,
    itemRenderer: (item: any, index: number) => UIComponent,
    config?: Partial<UIGrid>
  ): UIGrid {
    const grid = this.createComponent('grid', config) as UIGrid;
    grid.items = items;
    grid.columns = columns;
    grid.gap = config?.gap || 10;
    grid.itemRenderer = itemRenderer;

    return grid;
  }

  // ========================================================================
  // Public API - Component Management
  // ========================================================================

  /**
   * Add child component
   */
  public addChild(parent: UIComponent, child: UIComponent): void {
    if (child.parent) {
      this.removeChild(child.parent, child);
    }

    child.parent = parent;
    parent.children.push(child);
    this.needsRedraw = true;
  }

  /**
   * Remove child component
   */
  public removeChild(parent: UIComponent, child: UIComponent): void {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
      child.parent = null;
      this.needsRedraw = true;
    }
  }

  /**
   * Add component to root
   */
  public addToRoot(component: UIComponent): void {
    this.rootComponents.push(component);
    this.needsRedraw = true;
  }

  /**
   * Remove component from root
   */
  public removeFromRoot(component: UIComponent): void {
    const index = this.rootComponents.indexOf(component);
    if (index !== -1) {
      this.rootComponents.splice(index, 1);
      this.needsRedraw = true;
    }
  }

  /**
   * Destroy component
   */
  public destroyComponent(component: UIComponent): void {
    // Remove from parent
    if (component.parent) {
      this.removeChild(component.parent, component);
    } else {
      this.removeFromRoot(component);
    }

    // Destroy children
    component.children.forEach(child => this.destroyComponent(child));

    // Remove from map
    this.components.delete(component.id);

    this.needsRedraw = true;
  }

  /**
   * Find component by ID
   */
  public findComponent(id: string): UIComponent | null {
    return this.components.get(id) || null;
  }

  /**
   * Find components by tag
   */
  public findComponentsByTag(tag: string): UIComponent[] {
    const results: UIComponent[] = [];

    this.components.forEach(component => {
      if (component.tag === tag) {
        results.push(component);
      }
    });

    return results;
  }

  // ========================================================================
  // Public API - Modals
  // ========================================================================

  /**
   * Show modal
   */
  public showModal(modal: UIModal): void {
    this.modalStack.push(modal);
    this.addToRoot(modal);
    this.needsRedraw = true;

    // Announce to screen readers
    if (this.accessibility.announceChanges) {
      this.announceToScreenReader(`Modal opened: ${modal.title}`);
    }
  }

  /**
   * Close modal
   */
  public closeModal(modal: UIModal): void {
    const index = this.modalStack.indexOf(modal);
    if (index !== -1) {
      this.modalStack.splice(index, 1);
      this.removeFromRoot(modal);
      modal.onClose({ type: 'click' } as UIEvent);
      this.needsRedraw = true;

      // Announce to screen readers
      if (this.accessibility.announceChanges) {
        this.announceToScreenReader('Modal closed');
      }
    }
  }

  /**
   * Close top modal
   */
  public closeTopModal(): void {
    const modal = this.modalStack[this.modalStack.length - 1];
    if (modal) {
      this.closeModal(modal);
    }
  }

  // ========================================================================
  // Public API - Notifications
  // ========================================================================

  /**
   * Show notification
   */
  public showNotification(
    message: string,
    type: UINotification['notificationType'] = 'info',
    duration: number = 3
  ): UINotification {
    const notification = this.createNotification(message, type, { duration });

    // Position notification in stack
    const yOffset = this.notifications.length * 90;
    notification.position.y = 20 + yOffset;

    this.notifications.push(notification);
    this.addToRoot(notification);

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        this.closeNotification(notification);
      }, duration * 1000);
    }

    // Announce to screen readers
    if (this.accessibility.announceChanges) {
      this.announceToScreenReader(`${type}: ${message}`);
    }

    return notification;
  }

  /**
   * Close notification
   */
  public closeNotification(notification: UINotification): void {
    const index = this.notifications.indexOf(notification);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.removeFromRoot(notification);
      notification.onClose({ type: 'click' } as UIEvent);

      // Reposition remaining notifications
      this.notifications.forEach((notif, i) => {
        notif.position.y = 20 + (i * 90);
      });

      this.needsRedraw = true;
    }
  }

  // ========================================================================
  // Public API - Themes
  // ========================================================================

  /**
   * Set current theme
   */
  public setTheme(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (theme) {
      this.currentTheme = theme;
      this.needsRedraw = true;

      // Update all components with theme
      this.applyThemeToAllComponents();
    }
  }

  /**
   * Register theme
   */
  public registerTheme(name: string, theme: UITheme): void {
    this.themes.set(name, theme);
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): UITheme {
    return this.currentTheme;
  }

  // ========================================================================
  // Public API - Animation
  // ========================================================================

  /**
   * Animate component property
   */
  public animate(
    component: UIComponent,
    property: string,
    from: any,
    to: any,
    duration: number,
    config?: {
      delay?: number;
      easing?: EasingFunction;
      loop?: boolean;
      pingpong?: boolean;
      onComplete?: () => void;
    }
  ): UIAnimation {
    const animation: UIAnimation = {
      id: this.generateId(),
      property,
      from,
      to,
      duration,
      delay: config?.delay || 0,
      easing: config?.easing || 'ease_in_out',
      loop: config?.loop || false,
      pingpong: config?.pingpong || false,
      onComplete: config?.onComplete,
      isPlaying: true,
      currentTime: 0,
      progress: 0
    };

    component.animations.push(animation);
    this.activeAnimations.push(animation);

    return animation;
  }

  /**
   * Stop animation
   */
  public stopAnimation(animation: UIAnimation): void {
    animation.isPlaying = false;

    const index = this.activeAnimations.indexOf(animation);
    if (index !== -1) {
      this.activeAnimations.splice(index, 1);
    }
  }

  /**
   * Fade in component
   */
  public fadeIn(component: UIComponent, duration: number = 0.3): UIAnimation {
    component.opacity = 0;
    return this.animate(component, 'opacity', 0, 1, duration, { easing: 'ease_out' });
  }

  /**
   * Fade out component
   */
  public fadeOut(component: UIComponent, duration: number = 0.3): UIAnimation {
    return this.animate(component, 'opacity', component.opacity, 0, duration, {
      easing: 'ease_in',
      onComplete: () => {
        component.visible = false;
      }
    });
  }

  /**
   * Slide in component
   */
  public slideIn(
    component: UIComponent,
    direction: 'left' | 'right' | 'top' | 'bottom',
    duration: number = 0.5
  ): UIAnimation {
    const distance = 100;
    let fromX = component.position.x;
    let fromY = component.position.y;

    switch (direction) {
      case 'left':
        fromX -= distance;
        break;
      case 'right':
        fromX += distance;
        break;
      case 'top':
        fromY -= distance;
        break;
      case 'bottom':
        fromY += distance;
        break;
    }

    const property = direction === 'left' || direction === 'right' ? 'position.x' : 'position.y';
    const from = direction === 'left' || direction === 'right' ? fromX : fromY;
    const to = direction === 'left' || direction === 'right' ? component.position.x : component.position.y;

    return this.animate(component, property, from, to, duration, { easing: 'ease_out' });
  }

  /**
   * Scale component
   */
  public scale(component: UIComponent, from: number, to: number, duration: number): UIAnimation {
    return this.animate(component, 'scale', { x: from, y: from }, { x: to, y: to }, duration, {
      easing: 'ease_in_out'
    });
  }

  /**
   * Bounce animation
   */
  public bounce(component: UIComponent, intensity: number = 20, duration: number = 0.5): UIAnimation {
    const originalY = component.position.y;
    return this.animate(component, 'position.y', originalY, originalY - intensity, duration, {
      easing: 'bounce',
      pingpong: true
    });
  }

  // ========================================================================
  // Public API - Events
  // ========================================================================

  /**
   * Add event listener
   */
  public addEventListener(
    component: UIComponent,
    eventType: UIEventType,
    handler: UIEventHandler
  ): void {
    if (!component.events.has(eventType)) {
      component.events.set(eventType, []);
    }

    component.events.get(eventType)!.push(handler);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(
    component: UIComponent,
    eventType: UIEventType,
    handler: UIEventHandler
  ): void {
    const handlers = component.events.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Dispatch event
   */
  public dispatchEvent(event: UIEvent): void {
    const target = event.target;

    // Call handlers on target
    const handlers = target.events.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        if (!event.isPropagationStopped) {
          handler(event);
        }
      });
    }

    // Bubble up to parent
    if (!event.isPropagationStopped && target.parent) {
      event.currentTarget = target.parent;
      this.dispatchEvent(event);
    }
  }

  // ========================================================================
  // Public API - Rendering
  // ========================================================================

  /**
   * Render the UI
   */
  public render(): void {
    if (!this.needsRedraw) return;

    this.drawCallCount = 0;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render root components
    this.rootComponents.forEach(component => {
      this.renderComponent(component);
    });

    this.needsRedraw = false;
  }

  /**
   * Update animations and interactions
   */
  public update(deltaTime: number): void {
    // Update animations
    this.updateAnimations(deltaTime);

    // Process event queue
    this.processEventQueue();

    // Update layouts if needed
    this.updateLayouts();

    // Check if redraw is needed
    if (this.activeAnimations.length > 0) {
      this.needsRedraw = true;
    }
  }

  /**
   * Request redraw
   */
  public requestRedraw(): void {
    this.needsRedraw = true;
  }

  // ========================================================================
  // Private Helper Methods - Rendering
  // ========================================================================

  private renderComponent(component: UIComponent): void {
    if (!component.visible || component.opacity <= 0) return;

    if (this.drawCallCount >= this.MAX_DRAW_CALLS) {
      console.warn('Max draw calls reached');
      return;
    }

    this.ctx.save();

    // Apply transformations
    const screenPos = this.getScreenPosition(component);
    this.ctx.translate(screenPos.x, screenPos.y);
    this.ctx.rotate((component.rotation * Math.PI) / 180);
    this.ctx.scale(component.scale.x, component.scale.y);
    this.ctx.globalAlpha = component.opacity;

    // Apply pivot
    const pivotX = component.size.width * component.pivot.x;
    const pivotY = component.size.height * component.pivot.y;
    this.ctx.translate(-pivotX, -pivotY);

    // Render based on type
    switch (component.type) {
      case 'panel':
      case 'container':
        this.renderPanel(component);
        break;
      case 'button':
        this.renderButton(component as UIButton);
        break;
      case 'text':
        this.renderText(component as UIText);
        break;
      case 'image':
        this.renderImage(component as UIImage);
        break;
      case 'input':
        this.renderInput(component as UIInput);
        break;
      case 'slider':
        this.renderSlider(component as UISlider);
        break;
      case 'progress_bar':
        this.renderProgressBar(component as UIProgressBar);
        break;
      case 'modal':
        this.renderModal(component as UIModal);
        break;
      case 'notification':
        this.renderNotification(component as UINotification);
        break;
      default:
        this.renderPanel(component);
        break;
    }

    this.drawCallCount++;

    // Render children
    component.children.forEach(child => {
      this.renderComponent(child);
    });

    this.ctx.restore();
  }

  private renderPanel(component: UIComponent): void {
    const style = this.getEffectiveStyle(component);

    // Background
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor;

      if (style.borderRadius) {
        this.roundRect(0, 0, component.size.width, component.size.height, style.borderRadius);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(0, 0, component.size.width, component.size.height);
      }
    }

    // Border
    if (style.borderWidth && style.borderColor) {
      this.ctx.strokeStyle = style.borderColor;
      this.ctx.lineWidth = style.borderWidth;

      if (style.borderRadius) {
        this.roundRect(0, 0, component.size.width, component.size.height, style.borderRadius);
        this.ctx.stroke();
      } else {
        this.ctx.strokeRect(0, 0, component.size.width, component.size.height);
      }
    }
  }

  private renderButton(button: UIButton): void {
    const style = this.getEffectiveStyle(button);

    // Background
    this.ctx.fillStyle = style.backgroundColor || this.currentTheme.colors.primary;

    if (style.borderRadius) {
      this.roundRect(0, 0, button.size.width, button.size.height, style.borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, button.size.width, button.size.height);
    }

    // Border
    if (style.borderWidth && style.borderColor) {
      this.ctx.strokeStyle = style.borderColor;
      this.ctx.lineWidth = style.borderWidth;

      if (style.borderRadius) {
        this.roundRect(0, 0, button.size.width, button.size.height, style.borderRadius);
        this.ctx.stroke();
      } else {
        this.ctx.strokeRect(0, 0, button.size.width, button.size.height);
      }
    }

    // Text
    this.ctx.fillStyle = style.textColor || '#FFFFFF';
    this.ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(button.text, button.size.width / 2, button.size.height / 2);
  }

  private renderText(text: UIText): void {
    const style = this.getEffectiveStyle(text);

    this.ctx.fillStyle = style.textColor || this.currentTheme.colors.text;
    this.ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
    this.ctx.textAlign = (style.textAlign as CanvasTextAlign) || 'left';
    this.ctx.textBaseline = 'top';

    // Word wrap if needed
    if (text.wordWrap && text.maxWidth) {
      this.wrapText(text.text, 0, 0, text.maxWidth, style.lineHeight || 20);
    } else {
      this.ctx.fillText(text.text, 0, 0);
    }
  }

  private renderImage(image: UIImage): void {
    // Would load and render actual image
    // For now, render placeholder
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fillRect(0, 0, image.size.width, image.size.height);

    this.ctx.fillStyle = '#999999';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Image', image.size.width / 2, image.size.height / 2);
  }

  private renderInput(input: UIInput): void {
    const style = this.getEffectiveStyle(input);

    // Background
    this.ctx.fillStyle = style.backgroundColor || '#FFFFFF';
    if (style.borderRadius) {
      this.roundRect(0, 0, input.size.width, input.size.height, style.borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, input.size.width, input.size.height);
    }

    // Border
    this.ctx.strokeStyle = input.focused
      ? this.currentTheme.colors.primary
      : (style.borderColor || this.currentTheme.colors.border);
    this.ctx.lineWidth = input.focused ? 2 : 1;

    if (style.borderRadius) {
      this.roundRect(0, 0, input.size.width, input.size.height, style.borderRadius);
      this.ctx.stroke();
    } else {
      this.ctx.strokeRect(0, 0, input.size.width, input.size.height);
    }

    // Text or placeholder
    this.ctx.fillStyle = input.value ? (style.textColor || '#000000') : '#999999';
    this.ctx.font = `${style.fontSize || 14}px ${style.fontFamily || 'Arial'}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      input.value || input.placeholder,
      10,
      input.size.height / 2
    );
  }

  private renderSlider(slider: UISlider): void {
    const style = this.getEffectiveStyle(slider);

    if (slider.orientation === 'horizontal') {
      // Track
      const trackY = slider.size.height / 2 - 2;
      this.ctx.fillStyle = style.backgroundColor || this.currentTheme.colors.surface;
      this.ctx.fillRect(0, trackY, slider.size.width, 4);

      // Fill
      const fillWidth = ((slider.value - slider.min) / (slider.max - slider.min)) * slider.size.width;
      this.ctx.fillStyle = style.borderColor || this.currentTheme.colors.primary;
      this.ctx.fillRect(0, trackY, fillWidth, 4);

      // Thumb
      this.ctx.fillStyle = this.currentTheme.colors.primary;
      this.ctx.beginPath();
      this.ctx.arc(fillWidth, slider.size.height / 2, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Value display
    if (slider.showValue) {
      this.ctx.fillStyle = style.textColor || this.currentTheme.colors.text;
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(slider.value.toFixed(1), slider.size.width / 2, slider.size.height - 5);
    }
  }

  private renderProgressBar(progressBar: UIProgressBar): void {
    // Background
    this.ctx.fillStyle = progressBar.backgroundColor;
    if (progressBar.style.borderRadius) {
      this.roundRect(0, 0, progressBar.size.width, progressBar.size.height, progressBar.style.borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, progressBar.size.width, progressBar.size.height);
    }

    // Fill
    const fillWidth = (progressBar.value / 100) * progressBar.size.width;
    this.ctx.fillStyle = progressBar.color;
    if (progressBar.style.borderRadius) {
      this.roundRect(0, 0, fillWidth, progressBar.size.height, progressBar.style.borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, fillWidth, progressBar.size.height);
    }

    // Percentage text
    if (progressBar.showPercentage) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        `${Math.round(progressBar.value)}%`,
        progressBar.size.width / 2,
        progressBar.size.height / 2
      );
    }
  }

  private renderModal(modal: UIModal): void {
    // Backdrop
    if (modal.backdrop) {
      this.ctx.fillStyle = modal.backdropColor;
      this.ctx.fillRect(
        -modal.position.x,
        -modal.position.y,
        this.canvas.width,
        this.canvas.height
      );
    }

    // Modal box
    this.renderPanel(modal);

    // Title
    this.ctx.fillStyle = this.currentTheme.colors.text;
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(modal.title, modal.size.width / 2, 30);

    // Close button
    if (modal.closeButton) {
      this.ctx.fillStyle = this.currentTheme.colors.textSecondary;
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText('×', modal.size.width - 15, 25);
    }
  }

  private renderNotification(notification: UINotification): void {
    // Background color based on type
    const colors = {
      info: this.currentTheme.colors.info,
      success: this.currentTheme.colors.success,
      warning: this.currentTheme.colors.warning,
      error: this.currentTheme.colors.error
    };

    this.ctx.fillStyle = colors[notification.notificationType];
    if (notification.style.borderRadius) {
      this.roundRect(0, 0, notification.size.width, notification.size.height, notification.style.borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, notification.size.width, notification.size.height);
    }

    // Message
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.wrapText(notification.message, 15, notification.size.height / 2, notification.size.width - 40, 20);

    // Close button
    if (notification.showCloseButton) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText('×', notification.size.width - 10, notification.size.height / 2);
    }
  }

  // ========================================================================
  // Private Helper Methods - Utility
  // ========================================================================

  private generateId(): string {
    return `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getScreenPosition(component: UIComponent): { x: number; y: number } {
    // Calculate screen position based on anchor
    let x = component.position.x;
    let y = component.position.y;

    // Apply anchor
    switch (component.anchor) {
      case 'top_center':
        x += this.canvas.width / 2;
        break;
      case 'top_right':
        x += this.canvas.width;
        break;
      case 'middle_left':
        y += this.canvas.height / 2;
        break;
      case 'middle_center':
        x += this.canvas.width / 2;
        y += this.canvas.height / 2;
        break;
      case 'middle_right':
        x += this.canvas.width;
        y += this.canvas.height / 2;
        break;
      case 'bottom_left':
        y += this.canvas.height;
        break;
      case 'bottom_center':
        x += this.canvas.width / 2;
        y += this.canvas.height;
        break;
      case 'bottom_right':
        x += this.canvas.width;
        y += this.canvas.height;
        break;
    }

    // Add parent offset if has parent
    if (component.parent) {
      const parentPos = this.getScreenPosition(component.parent);
      x += parentPos.x;
      y += parentPos.y;
    }

    return { x, y };
  }

  private getEffectiveStyle(component: UIComponent): UIStyle {
    if (component.pressed && component.activeStyle) {
      return component.activeStyle;
    }

    if (component.hovered && component.hoverStyle) {
      return component.hoverStyle;
    }

    if (!component.enabled && component.disabledStyle) {
      return component.disabledStyle;
    }

    return component.style;
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
    this.ctx.closePath();
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    this.ctx.fillText(line, x, currentY);
  }

  private createDefaultStyle(): UIStyle {
    return {
      backgroundColor: this.currentTheme.colors.surface,
      borderColor: this.currentTheme.colors.border,
      borderWidth: 1,
      borderRadius: 4,
      textColor: this.currentTheme.colors.text,
      fontSize: 14,
      fontFamily: this.currentTheme.typography.fontFamily,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      cursor: 'default'
    };
  }

  private createDefaultTheme(): UITheme {
    return {
      name: 'default',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
        background: '#F3F4F6',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        shadow: 'rgba(0, 0, 0, 0.1)',
        disabled: '#9CA3AF'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: {
          small: 12,
          medium: 14,
          large: 18,
          xlarge: 24
        },
        fontWeight: {
          light: 300,
          normal: 400,
          bold: 700
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        sm: 2,
        md: 4,
        lg: 8
      },
      shadows: {
        small: '0 1px 2px rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 15px rgba(0, 0, 0, 0.15)'
      }
    };
  }

  // ========================================================================
  // Private Helper Methods - Events
  // ========================================================================

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private removeEventListeners(): void {
    // Would remove event listeners
  }

  private handleClick(e: MouseEvent): void {
    const component = this.getComponentAtPosition(e.offsetX, e.offsetY);
    if (component) {
      const event = this.createUIEvent('click', component, e);
      this.dispatchEvent(event);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const component = this.getComponentAtPosition(e.offsetX, e.offsetY);

    // Update hover state
    if (component !== this.hoveredComponent) {
      if (this.hoveredComponent) {
        this.hoveredComponent.hovered = false;
        const leaveEvent = this.createUIEvent('mouse_leave', this.hoveredComponent, e);
        this.dispatchEvent(leaveEvent);
      }

      if (component) {
        component.hovered = true;
        const enterEvent = this.createUIEvent('mouse_enter', component, e);
        this.dispatchEvent(enterEvent);
      }

      this.hoveredComponent = component;
      this.needsRedraw = true;
    }

    // Update cursor
    if (component) {
      this.canvas.style.cursor = component.style.cursor || 'default';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    const component = this.getComponentAtPosition(e.offsetX, e.offsetY);
    if (component) {
      component.pressed = true;
      const event = this.createUIEvent('mouse_down', component, e);
      this.dispatchEvent(event);
      this.needsRedraw = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    this.components.forEach(component => {
      if (component.pressed) {
        component.pressed = false;
        const event = this.createUIEvent('mouse_up', component, e);
        this.dispatchEvent(event);
      }
    });
    this.needsRedraw = true;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.focusedComponent) {
      const event = this.createUIEvent('key_down', this.focusedComponent, e);
      this.dispatchEvent(event);
    }

    // Handle escape for modals
    if (e.key === 'Escape' && this.accessibility.keyboardNavigation) {
      this.closeTopModal();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (this.focusedComponent) {
      const event = this.createUIEvent('key_up', this.focusedComponent, e);
      this.dispatchEvent(event);
    }
  }

  private handleResize(): void {
    this.updateResponsiveBreakpoint();
    this.needsRedraw = true;
  }

  private createUIEvent(type: UIEventType, target: UIComponent, nativeEvent: Event): UIEvent {
    const event: UIEvent = {
      type,
      target,
      currentTarget: target,
      timestamp: Date.now(),
      isPropagationStopped: false,
      isDefaultPrevented: false,
      stopPropagation: function() {
        this.isPropagationStopped = true;
      },
      preventDefault: function() {
        this.isDefaultPrevented = true;
      }
    };

    // Add mouse data
    if (nativeEvent instanceof MouseEvent) {
      event.mousePosition = { x: nativeEvent.offsetX, y: nativeEvent.offsetY };
      event.mouseButton = nativeEvent.button;
    }

    // Add keyboard data
    if (nativeEvent instanceof KeyboardEvent) {
      event.key = nativeEvent.key;
      event.keyCode = nativeEvent.keyCode;
      event.ctrlKey = nativeEvent.ctrlKey;
      event.shiftKey = nativeEvent.shiftKey;
      event.altKey = nativeEvent.altKey;
    }

    return event;
  }

  private getComponentAtPosition(x: number, y: number): UIComponent | null {
    // Check from top to bottom (reverse order for z-index)
    const sorted = [...this.rootComponents].sort((a, b) => b.zIndex - a.zIndex);

    for (const component of sorted) {
      const found = this.findComponentAtPosition(component, x, y);
      if (found) return found;
    }

    return null;
  }

  private findComponentAtPosition(component: UIComponent, x: number, y: number): UIComponent | null {
    if (!component.visible || !component.enabled) return null;

    const screenPos = this.getScreenPosition(component);
    const inBounds =
      x >= screenPos.x &&
      x <= screenPos.x + component.size.width &&
      y >= screenPos.y &&
      y <= screenPos.y + component.size.height;

    if (inBounds) {
      // Check children first (they're on top)
      for (const child of component.children) {
        const found = this.findComponentAtPosition(child, x, y);
        if (found) return found;
      }

      return component;
    }

    return null;
  }

  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.dispatchEvent(event);
    }
  }

  // ========================================================================
  // Private Helper Methods - Animation
  // ========================================================================

  private updateAnimations(deltaTime: number): void {
    this.activeAnimations.forEach(animation => {
      if (!animation.isPlaying) return;

      animation.currentTime += deltaTime;

      // Handle delay
      if (animation.currentTime < animation.delay) return;

      const adjustedTime = animation.currentTime - animation.delay;
      animation.progress = Math.min(1, adjustedTime / animation.duration);

      // Apply easing
      const easedProgress = this.applyEasing(animation.progress, animation.easing);

      // Interpolate value
      // (Would implement property interpolation here)

      // Check completion
      if (animation.progress >= 1) {
        if (animation.loop) {
          animation.currentTime = animation.delay;
          animation.progress = 0;
        } else {
          animation.isPlaying = false;
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      }
    });

    // Remove finished animations
    this.activeAnimations = this.activeAnimations.filter(a => a.isPlaying);
  }

  private applyEasing(t: number, easing: EasingFunction): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease_in':
        return t * t;
      case 'ease_out':
        return t * (2 - t);
      case 'ease_in_out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'ease_in_quad':
        return t * t;
      case 'ease_out_quad':
        return t * (2 - t);
      case 'ease_in_out_quad':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }

  // ========================================================================
  // Private Helper Methods - Layout
  // ========================================================================

  private updateLayouts(): void {
    // Would implement layout calculation
  }

  private initializeLayoutManagers(): void {
    // Would initialize layout managers
  }

  private updateResponsiveBreakpoint(): void {
    const width = this.canvas.width;

    if (width < this.responsive.breakpoints.sm) {
      this.responsive.currentBreakpoint = 'xs';
    } else if (width < this.responsive.breakpoints.md) {
      this.responsive.currentBreakpoint = 'sm';
    } else if (width < this.responsive.breakpoints.lg) {
      this.responsive.currentBreakpoint = 'md';
    } else if (width < this.responsive.breakpoints.xl) {
      this.responsive.currentBreakpoint = 'lg';
    } else if (width < this.responsive.breakpoints.xxl) {
      this.responsive.currentBreakpoint = 'xl';
    } else {
      this.responsive.currentBreakpoint = 'xxl';
    }
  }

  private applyThemeToAllComponents(): void {
    this.components.forEach(component => {
      // Update component styles with theme values
      if (!component.style.backgroundColor) {
        component.style.backgroundColor = this.currentTheme.colors.surface;
      }
      // ... update other properties
    });

    this.needsRedraw = true;
  }

  // ========================================================================
  // Private Helper Methods - Accessibility
  // ========================================================================

  private announceToScreenReader(message: string): void {
    if (!this.accessibility.screenReaderSupport) return;

    // Would use ARIA live region to announce
    console.log(`[Screen Reader] ${message}`);
  }
}
