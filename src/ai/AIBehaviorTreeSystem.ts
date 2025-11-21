import { Vector3, Observable } from '@babylonjs/core';

/**
 * Behavior tree node types
 */
export enum NodeType {
    // Composite nodes
    SEQUENCE = 'sequence',
    SELECTOR = 'selector',
    PARALLEL = 'parallel',
    RANDOM_SEQUENCE = 'random_sequence',
    RANDOM_SELECTOR = 'random_selector',

    // Decorator nodes
    INVERTER = 'inverter',
    REPEATER = 'repeater',
    REPEAT_UNTIL_FAIL = 'repeat_until_fail',
    REPEAT_UNTIL_SUCCESS = 'repeat_until_success',
    LIMITER = 'limiter',
    TIME_LIMIT = 'time_limit',
    COOLDOWN = 'cooldown',

    // Condition nodes
    CONDITION = 'condition',
    PROBABILITY = 'probability',

    // Action nodes
    ACTION = 'action',
    WAIT = 'wait'
}

/**
 * Node status
 */
export enum NodeStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
    RUNNING = 'running',
    INVALID = 'invalid'
}

/**
 * Behavior context (blackboard)
 */
export interface BehaviorContext {
    // Entity data
    entityId: string;
    position: Vector3;
    rotation: number;
    velocity: Vector3;

    // State
    currentAction?: string;
    targetPosition?: Vector3;
    targetEntity?: string;

    // Custom data
    [key: string]: any;
}

/**
 * Behavior tree node
 */
export abstract class BehaviorNode {
    public id: string;
    public type: NodeType;
    public children: BehaviorNode[] = [];
    public parent?: BehaviorNode;

    protected status: NodeStatus = NodeStatus.INVALID;
    protected startTime: number = 0;

    constructor(id: string, type: NodeType) {
        this.id = id;
        this.type = type;
    }

    /**
     * Execute node
     */
    public abstract execute(context: BehaviorContext, deltaTime: number): NodeStatus;

    /**
     * Reset node
     */
    public reset(): void {
        this.status = NodeStatus.INVALID;
        this.startTime = 0;

        for (const child of this.children) {
            child.reset();
        }
    }

    /**
     * Add child node
     */
    public addChild(child: BehaviorNode): void {
        child.parent = this;
        this.children.push(child);
    }

    /**
     * Remove child node
     */
    public removeChild(child: BehaviorNode): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = undefined;
        }
    }

    /**
     * Get status
     */
    public getStatus(): NodeStatus {
        return this.status;
    }
}

/**
 * Sequence node - executes children in order until one fails
 */
export class SequenceNode extends BehaviorNode {
    private currentChildIndex: number = 0;

    constructor(id: string) {
        super(id, NodeType.SEQUENCE);
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.SUCCESS;
        }

        while (this.currentChildIndex < this.children.length) {
            const child = this.children[this.currentChildIndex];
            const status = child.execute(context, deltaTime);

            if (status === NodeStatus.RUNNING) {
                this.status = NodeStatus.RUNNING;
                return NodeStatus.RUNNING;
            }

            if (status === NodeStatus.FAILURE) {
                this.currentChildIndex = 0;
                this.status = NodeStatus.FAILURE;
                return NodeStatus.FAILURE;
            }

            this.currentChildIndex++;
        }

        this.currentChildIndex = 0;
        this.status = NodeStatus.SUCCESS;
        return NodeStatus.SUCCESS;
    }

    public reset(): void {
        super.reset();
        this.currentChildIndex = 0;
    }
}

/**
 * Selector node - executes children until one succeeds
 */
export class SelectorNode extends BehaviorNode {
    private currentChildIndex: number = 0;

    constructor(id: string) {
        super(id, NodeType.SELECTOR);
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.FAILURE;
        }

        while (this.currentChildIndex < this.children.length) {
            const child = this.children[this.currentChildIndex];
            const status = child.execute(context, deltaTime);

            if (status === NodeStatus.RUNNING) {
                this.status = NodeStatus.RUNNING;
                return NodeStatus.RUNNING;
            }

            if (status === NodeStatus.SUCCESS) {
                this.currentChildIndex = 0;
                this.status = NodeStatus.SUCCESS;
                return NodeStatus.SUCCESS;
            }

            this.currentChildIndex++;
        }

        this.currentChildIndex = 0;
        this.status = NodeStatus.FAILURE;
        return NodeStatus.FAILURE;
    }

    public reset(): void {
        super.reset();
        this.currentChildIndex = 0;
    }
}

/**
 * Parallel node - executes all children simultaneously
 */
export class ParallelNode extends BehaviorNode {
    private successPolicy: 'all' | 'one' | number;
    private failurePolicy: 'all' | 'one' | number;

    constructor(id: string, successPolicy: 'all' | 'one' | number = 'all', failurePolicy: 'all' | 'one' | number = 'one') {
        super(id, NodeType.PARALLEL);
        this.successPolicy = successPolicy;
        this.failurePolicy = failurePolicy;
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        let successCount = 0;
        let failureCount = 0;
        let runningCount = 0;

        for (const child of this.children) {
            const status = child.execute(context, deltaTime);

            switch (status) {
                case NodeStatus.SUCCESS:
                    successCount++;
                    break;
                case NodeStatus.FAILURE:
                    failureCount++;
                    break;
                case NodeStatus.RUNNING:
                    runningCount++;
                    break;
            }
        }

        // Check failure policy
        if (this.failurePolicy === 'one' && failureCount > 0) {
            this.status = NodeStatus.FAILURE;
            return NodeStatus.FAILURE;
        }

        if (this.failurePolicy === 'all' && failureCount === this.children.length) {
            this.status = NodeStatus.FAILURE;
            return NodeStatus.FAILURE;
        }

        if (typeof this.failurePolicy === 'number' && failureCount >= this.failurePolicy) {
            this.status = NodeStatus.FAILURE;
            return NodeStatus.FAILURE;
        }

        // Check success policy
        if (this.successPolicy === 'one' && successCount > 0) {
            this.status = NodeStatus.SUCCESS;
            return NodeStatus.SUCCESS;
        }

        if (this.successPolicy === 'all' && successCount === this.children.length) {
            this.status = NodeStatus.SUCCESS;
            return NodeStatus.SUCCESS;
        }

        if (typeof this.successPolicy === 'number' && successCount >= this.successPolicy) {
            this.status = NodeStatus.SUCCESS;
            return NodeStatus.SUCCESS;
        }

        this.status = NodeStatus.RUNNING;
        return NodeStatus.RUNNING;
    }
}

/**
 * Random sequence node
 */
export class RandomSequenceNode extends SequenceNode {
    private shuffled: boolean = false;

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (!this.shuffled) {
            this.shuffleChildren();
            this.shuffled = true;
        }

        const result = super.execute(context, deltaTime);

        if (result !== NodeStatus.RUNNING) {
            this.shuffled = false;
        }

        return result;
    }

    private shuffleChildren(): void {
        for (let i = this.children.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.children[i], this.children[j]] = [this.children[j], this.children[i]];
        }
    }
}

/**
 * Inverter decorator node
 */
export class InverterNode extends BehaviorNode {
    constructor(id: string, child?: BehaviorNode) {
        super(id, NodeType.INVERTER);
        if (child) {
            this.addChild(child);
        }
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.FAILURE;
        }

        const status = this.children[0].execute(context, deltaTime);

        if (status === NodeStatus.RUNNING) {
            return NodeStatus.RUNNING;
        }

        this.status = status === NodeStatus.SUCCESS ? NodeStatus.FAILURE : NodeStatus.SUCCESS;
        return this.status;
    }
}

/**
 * Repeater decorator node
 */
export class RepeaterNode extends BehaviorNode {
    private count: number;
    private currentCount: number = 0;

    constructor(id: string, count: number = -1, child?: BehaviorNode) {
        super(id, NodeType.REPEATER);
        this.count = count; // -1 = infinite
        if (child) {
            this.addChild(child);
        }
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.SUCCESS;
        }

        const child = this.children[0];

        while (this.count < 0 || this.currentCount < this.count) {
            const status = child.execute(context, deltaTime);

            if (status === NodeStatus.RUNNING) {
                return NodeStatus.RUNNING;
            }

            child.reset();
            this.currentCount++;

            if (this.currentCount >= this.count && this.count >= 0) {
                break;
            }
        }

        this.currentCount = 0;
        return NodeStatus.SUCCESS;
    }

    public reset(): void {
        super.reset();
        this.currentCount = 0;
    }
}

/**
 * Time limit decorator node
 */
export class TimeLimitNode extends BehaviorNode {
    private timeLimit: number;
    private elapsed: number = 0;

    constructor(id: string, timeLimit: number, child?: BehaviorNode) {
        super(id, NodeType.TIME_LIMIT);
        this.timeLimit = timeLimit;
        if (child) {
            this.addChild(child);
        }
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.FAILURE;
        }

        this.elapsed += deltaTime;

        if (this.elapsed >= this.timeLimit) {
            this.elapsed = 0;
            return NodeStatus.FAILURE;
        }

        const status = this.children[0].execute(context, deltaTime);

        if (status !== NodeStatus.RUNNING) {
            this.elapsed = 0;
        }

        return status;
    }

    public reset(): void {
        super.reset();
        this.elapsed = 0;
    }
}

/**
 * Cooldown decorator node
 */
export class CooldownNode extends BehaviorNode {
    private cooldownTime: number;
    private lastExecutionTime: number = 0;

    constructor(id: string, cooldownTime: number, child?: BehaviorNode) {
        super(id, NodeType.COOLDOWN);
        this.cooldownTime = cooldownTime;
        if (child) {
            this.addChild(child);
        }
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.FAILURE;
        }

        const now = Date.now();

        if (now - this.lastExecutionTime < this.cooldownTime) {
            return NodeStatus.FAILURE;
        }

        const status = this.children[0].execute(context, deltaTime);

        if (status === NodeStatus.SUCCESS) {
            this.lastExecutionTime = now;
        }

        return status;
    }
}

/**
 * Condition node
 */
export class ConditionNode extends BehaviorNode {
    private condition: (context: BehaviorContext) => boolean;

    constructor(id: string, condition: (context: BehaviorContext) => boolean) {
        super(id, NodeType.CONDITION);
        this.condition = condition;
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        this.status = this.condition(context) ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
        return this.status;
    }
}

/**
 * Probability node
 */
export class ProbabilityNode extends BehaviorNode {
    private probability: number;

    constructor(id: string, probability: number, child?: BehaviorNode) {
        super(id, NodeType.PROBABILITY);
        this.probability = Math.max(0, Math.min(1, probability));
        if (child) {
            this.addChild(child);
        }
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.children.length === 0) {
            return NodeStatus.FAILURE;
        }

        if (Math.random() > this.probability) {
            return NodeStatus.FAILURE;
        }

        return this.children[0].execute(context, deltaTime);
    }
}

/**
 * Action node
 */
export class ActionNode extends BehaviorNode {
    private action: (context: BehaviorContext, deltaTime: number) => NodeStatus;

    constructor(id: string, action: (context: BehaviorContext, deltaTime: number) => NodeStatus) {
        super(id, NodeType.ACTION);
        this.action = action;
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        this.status = this.action(context, deltaTime);
        return this.status;
    }
}

/**
 * Wait node
 */
export class WaitNode extends BehaviorNode {
    private waitTime: number;
    private elapsed: number = 0;

    constructor(id: string, waitTime: number) {
        super(id, NodeType.WAIT);
        this.waitTime = waitTime;
    }

    public execute(context: BehaviorContext, deltaTime: number): NodeStatus {
        if (this.elapsed === 0) {
            this.startTime = Date.now();
        }

        this.elapsed += deltaTime;

        if (this.elapsed >= this.waitTime) {
            this.elapsed = 0;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    }

    public reset(): void {
        super.reset();
        this.elapsed = 0;
    }
}

/**
 * Behavior tree
 */
export class BehaviorTree {
    public id: string;
    public root?: BehaviorNode;
    private context: BehaviorContext;

    // Observables
    private onNodeExecutedObservable: Observable<{ node: BehaviorNode; status: NodeStatus }> = new Observable();

    constructor(id: string, context: BehaviorContext, root?: BehaviorNode) {
        this.id = id;
        this.context = context;
        this.root = root;
    }

    /**
     * Tick the behavior tree
     */
    public tick(deltaTime: number): NodeStatus {
        if (!this.root) {
            return NodeStatus.INVALID;
        }

        const status = this.root.execute(this.context, deltaTime);
        this.onNodeExecutedObservable.notifyObservers({ node: this.root, status });

        return status;
    }

    /**
     * Reset tree
     */
    public reset(): void {
        if (this.root) {
            this.root.reset();
        }
    }

    /**
     * Get context
     */
    public getContext(): BehaviorContext {
        return this.context;
    }

    /**
     * Set context value
     */
    public setContextValue(key: string, value: any): void {
        this.context[key] = value;
    }

    /**
     * Get context value
     */
    public getContextValue(key: string): any {
        return this.context[key];
    }

    /**
     * Subscribe to node execution
     */
    public onNodeExecuted(callback: (data: { node: BehaviorNode; status: NodeStatus }) => void): void {
        this.onNodeExecutedObservable.add(callback);
    }
}

/**
 * AI Behavior Tree System
 * Manages multiple behavior trees for AI entities
 */
export class AIBehaviorTreeSystem {
    private trees: Map<string, BehaviorTree> = new Map();
    private enabled: boolean = true;

    /**
     * Create behavior tree
     */
    public createTree(entityId: string, context: BehaviorContext, root?: BehaviorNode): BehaviorTree {
        const tree = new BehaviorTree(entityId, context, root);
        this.trees.set(entityId, tree);
        return tree;
    }

    /**
     * Remove behavior tree
     */
    public removeTree(entityId: string): void {
        this.trees.delete(entityId);
    }

    /**
     * Get behavior tree
     */
    public getTree(entityId: string): BehaviorTree | undefined {
        return this.trees.get(entityId);
    }

    /**
     * Update all behavior trees
     */
    public update(deltaTime: number): void {
        if (!this.enabled) return;

        for (const tree of this.trees.values()) {
            tree.tick(deltaTime);
        }
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Clear all trees
     */
    public clear(): void {
        this.trees.clear();
    }
}

/**
 * Baseball-specific behavior tree builders
 */
export class BaseballBehaviorTreeBuilder {
    /**
     * Build batting behavior tree
     */
    public static buildBattingBehavior(entityId: string, context: BehaviorContext): BehaviorTree {
        // Root selector: Try different batting strategies
        const root = new SelectorNode('batting_root');

        // Strategy 1: Power swing on favorable count
        const powerSwingSeq = new SequenceNode('power_swing_sequence');
        powerSwingSeq.addChild(new ConditionNode('favorable_count', (ctx) => {
            return ctx.ballCount >= 2 || ctx.strikeCount === 0;
        }));
        powerSwingSeq.addChild(new ConditionNode('pitch_in_zone', (ctx) => {
            return ctx.pitchInStrikeZone === true;
        }));
        powerSwingSeq.addChild(new ActionNode('execute_power_swing', (ctx) => {
            ctx.currentAction = 'power_swing';
            return NodeStatus.SUCCESS;
        }));

        // Strategy 2: Contact swing on two strikes
        const contactSwingSeq = new SequenceNode('contact_swing_sequence');
        contactSwingSeq.addChild(new ConditionNode('two_strikes', (ctx) => {
            return ctx.strikeCount === 2;
        }));
        contactSwingSeq.addChild(new ActionNode('execute_contact_swing', (ctx) => {
            ctx.currentAction = 'contact_swing';
            return NodeStatus.SUCCESS;
        }));

        // Strategy 3: Take pitch
        const takePitchAction = new ActionNode('take_pitch', (ctx) => {
            ctx.currentAction = 'take';
            return NodeStatus.SUCCESS;
        });

        root.addChild(powerSwingSeq);
        root.addChild(contactSwingSeq);
        root.addChild(takePitchAction);

        return new BehaviorTree(entityId, context, root);
    }

    /**
     * Build pitching behavior tree
     */
    public static buildPitchingBehavior(entityId: string, context: BehaviorContext): BehaviorTree {
        const root = new SequenceNode('pitching_root');

        // Select pitch type
        const selectPitchType = new SelectorNode('select_pitch_type');

        // Fastball on favorable count
        const fastballSeq = new SequenceNode('fastball_sequence');
        fastballSeq.addChild(new ConditionNode('ahead_in_count', (ctx) => {
            return ctx.strikeCount > ctx.ballCount;
        }));
        fastballSeq.addChild(new ActionNode('throw_fastball', (ctx) => {
            ctx.selectedPitch = 'fastball';
            return NodeStatus.SUCCESS;
        }));

        // Breaking ball otherwise
        const breakingBallAction = new ActionNode('throw_breaking_ball', (ctx) => {
            ctx.selectedPitch = Math.random() > 0.5 ? 'curveball' : 'slider';
            return NodeStatus.SUCCESS;
        });

        selectPitchType.addChild(fastballSeq);
        selectPitchType.addChild(breakingBallAction);

        // Aim pitch
        const aimPitch = new ActionNode('aim_pitch', (ctx) => {
            // Aim at corners on two strikes
            if (ctx.strikeCount === 2) {
                ctx.targetLocation = { x: Math.random() > 0.5 ? 0.7 : -0.7, y: 0.5 };
            } else {
                ctx.targetLocation = { x: 0, y: 0.5 };
            }
            return NodeStatus.SUCCESS;
        });

        // Execute pitch
        const executePitch = new ActionNode('execute_pitch', (ctx) => {
            ctx.currentAction = 'pitch';
            return NodeStatus.SUCCESS;
        });

        root.addChild(selectPitchType);
        root.addChild(aimPitch);
        root.addChild(executePitch);

        return new BehaviorTree(entityId, context, root);
    }

    /**
     * Build fielding behavior tree
     */
    public static buildFieldingBehavior(entityId: string, context: BehaviorContext): BehaviorTree {
        const root = new SelectorNode('fielding_root');

        // Sequence for catching ball in air
        const catchSeq = new SequenceNode('catch_sequence');
        catchSeq.addChild(new ConditionNode('ball_in_air', (ctx) => {
            return ctx.ballInAir === true;
        }));
        catchSeq.addChild(new ActionNode('move_to_ball', (ctx) => {
            ctx.currentAction = 'move_to_ball';
            return ctx.atBallPosition ? NodeStatus.SUCCESS : NodeStatus.RUNNING;
        }));
        catchSeq.addChild(new ActionNode('catch_ball', (ctx) => {
            ctx.currentAction = 'catch';
            return NodeStatus.SUCCESS;
        }));

        // Sequence for fielding ground ball
        const fieldGroundBallSeq = new SequenceNode('field_ground_ball_sequence');
        fieldGroundBallSeq.addChild(new ConditionNode('ball_on_ground', (ctx) => {
            return ctx.ballOnGround === true;
        }));
        fieldGroundBallSeq.addChild(new ActionNode('move_to_ball', (ctx) => {
            ctx.currentAction = 'move_to_ball';
            return ctx.atBallPosition ? NodeStatus.SUCCESS : NodeStatus.RUNNING;
        }));
        fieldGroundBallSeq.addChild(new ActionNode('field_ball', (ctx) => {
            ctx.currentAction = 'field';
            return NodeStatus.SUCCESS;
        }));

        // Throw to base
        const throwSeq = new SequenceNode('throw_sequence');
        throwSeq.addChild(new ConditionNode('has_ball', (ctx) => {
            return ctx.hasBall === true;
        }));
        throwSeq.addChild(new ActionNode('select_base', (ctx) => {
            // Choose nearest base with runner
            ctx.targetBase = ctx.nearestRunnerBase || 'first';
            return NodeStatus.SUCCESS;
        }));
        throwSeq.addChild(new ActionNode('throw_to_base', (ctx) => {
            ctx.currentAction = 'throw';
            return NodeStatus.SUCCESS;
        }));

        root.addChild(catchSeq);
        root.addChild(fieldGroundBallSeq);
        root.addChild(throwSeq);

        return new BehaviorTree(entityId, context, root);
    }

    /**
     * Build base running behavior tree
     */
    public static buildBaseRunningBehavior(entityId: string, context: BehaviorContext): BehaviorTree {
        const root = new SelectorNode('baserunning_root');

        // Steal base
        const stealSeq = new SequenceNode('steal_sequence');
        stealSeq.addChild(new ConditionNode('good_steal_opportunity', (ctx) => {
            return ctx.pitcherInWindup && ctx.catcherSlowThrow && Math.random() > 0.5;
        }));
        stealSeq.addChild(new ActionNode('steal_base', (ctx) => {
            ctx.currentAction = 'steal';
            return NodeStatus.SUCCESS;
        }));

        // Advance on hit
        const advanceSeq = new SequenceNode('advance_sequence');
        advanceSeq.addChild(new ConditionNode('ball_hit', (ctx) => {
            return ctx.ballHit === true;
        }));
        advanceSeq.addChild(new ConditionNode('safe_to_advance', (ctx) => {
            return ctx.ballInOutfield || ctx.ballPastInfielders;
        }));
        advanceSeq.addChild(new ActionNode('advance_base', (ctx) => {
            ctx.currentAction = 'advance';
            return NodeStatus.SUCCESS;
        }));

        // Stay on base
        const stayAction = new ActionNode('stay_on_base', (ctx) => {
            ctx.currentAction = 'stay';
            return NodeStatus.SUCCESS;
        });

        root.addChild(stealSeq);
        root.addChild(advanceSeq);
        root.addChild(stayAction);

        return new BehaviorTree(entityId, context, root);
    }
}
