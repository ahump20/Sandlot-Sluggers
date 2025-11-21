import { Scene, Engine, AbstractEngine, Observable, SceneInstrumentation, EngineInstrumentation } from '@babylonjs/core';

/**
 * Performance metric types
 */
export enum MetricType {
    FPS = 'fps',
    FRAME_TIME = 'frame_time',
    DRAW_CALLS = 'draw_calls',
    TRIANGLES = 'triangles',
    VERTICES = 'vertices',
    TEXTURES = 'textures',
    MATERIALS = 'materials',
    MESHES = 'meshes',
    PARTICLES = 'particles',
    LIGHTS = 'lights',
    SHADOWS = 'shadows',
    MEMORY = 'memory',
    GPU_TIME = 'gpu_time',
    CPU_TIME = 'cpu_time',
    PHYSICS_TIME = 'physics_time',
    RENDER_TIME = 'render_time',
    ANIMATION_TIME = 'animation_time',
    SCRIPT_TIME = 'script_time',
    NETWORK_TIME = 'network_time'
}

/**
 * Performance sample
 */
export interface PerformanceSample {
    timestamp: number;
    type: MetricType;
    value: number;
    label?: string;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
    min: number;
    max: number;
    average: number;
    median: number;
    percentile95: number;
    percentile99: number;
    standardDeviation: number;
    sampleCount: number;
}

/**
 * Performance benchmark
 */
export interface PerformanceBenchmark {
    id: string;
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    samples: PerformanceSample[];
    stats?: PerformanceStats;
}

/**
 * Performance warning threshold
 */
export interface PerformanceThreshold {
    metric: MetricType;
    warningValue: number;
    criticalValue: number;
    comparison: 'above' | 'below';
}

/**
 * Performance issue
 */
export interface PerformanceIssue {
    id: string;
    timestamp: number;
    metric: MetricType;
    severity: 'warning' | 'critical';
    value: number;
    threshold: number;
    message: string;
    stackTrace?: string;
}

/**
 * Performance report
 */
export interface PerformanceReport {
    timestamp: number;
    duration: number;
    metrics: Map<MetricType, PerformanceStats>;
    issues: PerformanceIssue[];
    benchmarks: PerformanceBenchmark[];
    recommendations: string[];
}

/**
 * Profiler marker
 */
export interface ProfilerMarker {
    id: string;
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    parent?: string;
    children: string[];
    cpuTime?: number;
    memoryDelta?: number;
}

/**
 * Performance Profiler System
 * Comprehensive performance monitoring and analysis
 */
export class PerformanceProfiler {
    private scene: Scene;
    private engine: AbstractEngine;

    // Instrumentation
    private sceneInstrumentation: SceneInstrumentation;
    private engineInstrumentation: EngineInstrumentation;

    // Metrics collection
    private metricSamples: Map<MetricType, PerformanceSample[]> = new Map();
    private maxSamples: number = 300; // 5 seconds at 60fps
    private samplingInterval: number = 100; // ms

    // Benchmarks
    private activeBenchmarks: Map<string, PerformanceBenchmark> = new Map();
    private completedBenchmarks: PerformanceBenchmark[] = [];

    // Markers for custom profiling
    private activeMarkers: Map<string, ProfilerMarker> = new Map();
    private completedMarkers: ProfilerMarker[] = [];
    private markerIdCounter: number = 0;

    // Thresholds
    private thresholds: Map<MetricType, PerformanceThreshold> = new Map();

    // Issues tracking
    private detectedIssues: PerformanceIssue[] = [];
    private maxIssues: number = 100;

    // Observables
    private onPerformanceIssueObservable: Observable<PerformanceIssue> = new Observable();
    private onMetricSampleObservable: Observable<PerformanceSample> = new Observable();

    // Settings
    private enabled: boolean = true;
    private detailedProfiling: boolean = false;
    private autoReporting: boolean = false;
    private reportInterval: number = 60000; // 1 minute

    // Timers
    private samplingTimer?: number;
    private reportTimer?: number;

    // Memory tracking
    private lastMemoryCheck: number = 0;
    private memoryCheckInterval: number = 1000;

    constructor(scene: Scene) {
        this.scene = scene;
        this.engine = scene.getEngine();

        this.sceneInstrumentation = new SceneInstrumentation(scene);
        this.engineInstrumentation = new EngineInstrumentation(this.engine);

        this.initializeThresholds();
        this.initializeInstrumentation();
        this.startSampling();
    }

    /**
     * Initialize default thresholds
     */
    private initializeThresholds(): void {
        this.thresholds.set(MetricType.FPS, {
            metric: MetricType.FPS,
            warningValue: 30,
            criticalValue: 20,
            comparison: 'below'
        });

        this.thresholds.set(MetricType.FRAME_TIME, {
            metric: MetricType.FRAME_TIME,
            warningValue: 33.33, // 30 fps
            criticalValue: 50,    // 20 fps
            comparison: 'above'
        });

        this.thresholds.set(MetricType.DRAW_CALLS, {
            metric: MetricType.DRAW_CALLS,
            warningValue: 1000,
            criticalValue: 2000,
            comparison: 'above'
        });

        this.thresholds.set(MetricType.TRIANGLES, {
            metric: MetricType.TRIANGLES,
            warningValue: 1000000,
            criticalValue: 2000000,
            comparison: 'above'
        });

        this.thresholds.set(MetricType.PARTICLES, {
            metric: MetricType.PARTICLES,
            warningValue: 50000,
            criticalValue: 100000,
            comparison: 'above'
        });
    }

    /**
     * Initialize instrumentation
     */
    private initializeInstrumentation(): void {
        this.sceneInstrumentation.captureFrameTime = true;
        this.sceneInstrumentation.capturePhysicsTime = true;
        this.sceneInstrumentation.captureRenderTime = true;
        this.sceneInstrumentation.captureAnimationsTime = true;
        this.sceneInstrumentation.captureParticlesRenderTime = true;

        this.engineInstrumentation.captureGPUFrameTime = true;
    }

    /**
     * Start sampling metrics
     */
    private startSampling(): void {
        if (this.samplingTimer) {
            clearInterval(this.samplingTimer);
        }

        this.samplingTimer = window.setInterval(() => {
            if (this.enabled) {
                this.sampleMetrics();
            }
        }, this.samplingInterval);

        if (this.autoReporting) {
            this.reportTimer = window.setInterval(() => {
                this.generateReport();
            }, this.reportInterval);
        }
    }

    /**
     * Sample all metrics
     */
    private sampleMetrics(): void {
        const now = performance.now();

        // FPS
        this.addSample(MetricType.FPS, this.engine.getFps());

        // Frame time
        this.addSample(MetricType.FRAME_TIME, this.sceneInstrumentation.frameTimeCounter.lastSecAverage);

        // Draw calls - API not available in this version
        // this.addSample(MetricType.DRAW_CALLS, this.engineInstrumentation.drawCallsCounter.lastSecAverage);

        // Render stats - getInfo() not available in this version
        // const renderInfo = this.scene.getEngine().getInfo();
        // this.addSample(MetricType.TRIANGLES, renderInfo.numTotalTriangles || 0);
        // this.addSample(MetricType.VERTICES, renderInfo.numTotalVertices || 0);

        // Scene stats
        this.addSample(MetricType.MESHES, this.scene.meshes.length);
        this.addSample(MetricType.MATERIALS, this.scene.materials.length);
        this.addSample(MetricType.TEXTURES, this.scene.textures.length);
        this.addSample(MetricType.LIGHTS, this.scene.lights.length);

        // Particles
        const particleCount = this.scene.particleSystems.reduce((total, ps) => {
            return total + ps.getActiveCount();
        }, 0);
        this.addSample(MetricType.PARTICLES, particleCount);

        // Detailed timing
        if (this.detailedProfiling) {
            this.addSample(MetricType.PHYSICS_TIME, this.sceneInstrumentation.physicsTimeCounter.lastSecAverage);
            this.addSample(MetricType.RENDER_TIME, this.sceneInstrumentation.renderTimeCounter.lastSecAverage);
            this.addSample(MetricType.ANIMATION_TIME, this.sceneInstrumentation.animationsTimeCounter.lastSecAverage);

            // GPU time
            if (this.engineInstrumentation.gpuFrameTimeCounter) {
                this.addSample(MetricType.GPU_TIME, this.engineInstrumentation.gpuFrameTimeCounter.lastSecAverage);
            }
        }

        // Memory (less frequently)
        if (now - this.lastMemoryCheck > this.memoryCheckInterval) {
            this.sampleMemory();
            this.lastMemoryCheck = now;
        }

        // Check thresholds
        this.checkThresholds();
    }

    /**
     * Sample memory usage
     */
    private sampleMemory(): void {
        if ('memory' in performance && (performance as any).memory) {
            const memory = (performance as any).memory;
            const usedMB = memory.usedJSHeapSize / (1024 * 1024);
            this.addSample(MetricType.MEMORY, usedMB);
        }
    }

    /**
     * Add metric sample
     */
    private addSample(type: MetricType, value: number, label?: string): void {
        if (!this.metricSamples.has(type)) {
            this.metricSamples.set(type, []);
        }

        const samples = this.metricSamples.get(type)!;
        const sample: PerformanceSample = {
            timestamp: performance.now(),
            type,
            value,
            label
        };

        samples.push(sample);

        // Trim old samples
        if (samples.length > this.maxSamples) {
            samples.shift();
        }

        // Notify observers
        this.onMetricSampleObservable.notifyObservers(sample);
    }

    /**
     * Check performance thresholds
     */
    private checkThresholds(): void {
        for (const [metricType, threshold] of this.thresholds) {
            const samples = this.metricSamples.get(metricType);
            if (!samples || samples.length === 0) continue;

            const latestSample = samples[samples.length - 1];
            const value = latestSample.value;

            let isWarning = false;
            let isCritical = false;

            if (threshold.comparison === 'above') {
                isWarning = value > threshold.warningValue;
                isCritical = value > threshold.criticalValue;
            } else {
                isWarning = value < threshold.warningValue;
                isCritical = value < threshold.criticalValue;
            }

            if (isCritical || isWarning) {
                this.reportIssue(
                    metricType,
                    isCritical ? 'critical' : 'warning',
                    value,
                    isCritical ? threshold.criticalValue : threshold.warningValue
                );
            }
        }
    }

    /**
     * Report performance issue
     */
    private reportIssue(
        metric: MetricType,
        severity: 'warning' | 'critical',
        value: number,
        threshold: number
    ): void {
        const issue: PerformanceIssue = {
            id: `issue_${Date.now()}_${metric}`,
            timestamp: Date.now(),
            metric,
            severity,
            value,
            threshold,
            message: this.generateIssueMessage(metric, severity, value, threshold)
        };

        this.detectedIssues.push(issue);

        // Trim old issues
        if (this.detectedIssues.length > this.maxIssues) {
            this.detectedIssues.shift();
        }

        // Notify observers
        this.onPerformanceIssueObservable.notifyObservers(issue);
    }

    /**
     * Generate issue message
     */
    private generateIssueMessage(
        metric: MetricType,
        severity: 'warning' | 'critical',
        value: number,
        threshold: number
    ): string {
        const severityText = severity === 'critical' ? 'CRITICAL' : 'WARNING';

        switch (metric) {
            case MetricType.FPS:
                return `${severityText}: Low FPS (${value.toFixed(1)} fps, threshold: ${threshold} fps)`;
            case MetricType.FRAME_TIME:
                return `${severityText}: High frame time (${value.toFixed(2)} ms, threshold: ${threshold} ms)`;
            case MetricType.DRAW_CALLS:
                return `${severityText}: Too many draw calls (${value}, threshold: ${threshold})`;
            case MetricType.TRIANGLES:
                return `${severityText}: Too many triangles (${value.toLocaleString()}, threshold: ${threshold.toLocaleString()})`;
            case MetricType.MEMORY:
                return `${severityText}: High memory usage (${value.toFixed(1)} MB, threshold: ${threshold} MB)`;
            case MetricType.PARTICLES:
                return `${severityText}: Too many particles (${value}, threshold: ${threshold})`;
            default:
                return `${severityText}: Performance issue with ${metric}`;
        }
    }

    /**
     * Start benchmark
     */
    public startBenchmark(name: string): string {
        const id = `benchmark_${this.activeBenchmarks.size}`;
        const benchmark: PerformanceBenchmark = {
            id,
            name,
            startTime: performance.now(),
            samples: []
        };

        this.activeBenchmarks.set(id, benchmark);
        return id;
    }

    /**
     * End benchmark
     */
    public endBenchmark(id: string): PerformanceBenchmark | null {
        const benchmark = this.activeBenchmarks.get(id);
        if (!benchmark) return null;

        benchmark.endTime = performance.now();
        benchmark.duration = benchmark.endTime - benchmark.startTime;
        benchmark.stats = this.calculateStats(benchmark.samples);

        this.activeBenchmarks.delete(id);
        this.completedBenchmarks.push(benchmark);

        return benchmark;
    }

    /**
     * Add sample to benchmark
     */
    public addBenchmarkSample(benchmarkId: string, type: MetricType, value: number): void {
        const benchmark = this.activeBenchmarks.get(benchmarkId);
        if (!benchmark) return;

        benchmark.samples.push({
            timestamp: performance.now(),
            type,
            value
        });
    }

    /**
     * Start custom profiler marker
     */
    public beginMarker(name: string, parent?: string): string {
        const id = `marker_${this.markerIdCounter++}`;
        const marker: ProfilerMarker = {
            id,
            name,
            startTime: performance.now(),
            parent,
            children: []
        };

        if (parent && this.activeMarkers.has(parent)) {
            this.activeMarkers.get(parent)!.children.push(id);
        }

        this.activeMarkers.set(id, marker);
        return id;
    }

    /**
     * End custom profiler marker
     */
    public endMarker(id: string): ProfilerMarker | null {
        const marker = this.activeMarkers.get(id);
        if (!marker) return null;

        marker.endTime = performance.now();
        marker.duration = marker.endTime - marker.startTime;

        // Capture memory if available
        if ('memory' in performance && (performance as any).memory) {
            // Memory delta would require tracking start memory
            marker.memoryDelta = 0;
        }

        this.activeMarkers.delete(id);
        this.completedMarkers.push(marker);

        return marker;
    }

    /**
     * Measure function execution
     */
    public async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
        const markerId = this.beginMarker(name);
        const startTime = performance.now();

        try {
            const result = await fn();
            const duration = performance.now() - startTime;
            this.endMarker(markerId);

            return { result, duration };
        } catch (error) {
            this.endMarker(markerId);
            throw error;
        }
    }

    /**
     * Measure synchronous function execution
     */
    public measure<T>(name: string, fn: () => T): { result: T; duration: number } {
        const markerId = this.beginMarker(name);
        const startTime = performance.now();

        try {
            const result = fn();
            const duration = performance.now() - startTime;
            this.endMarker(markerId);

            return { result, duration };
        } catch (error) {
            this.endMarker(markerId);
            throw error;
        }
    }

    /**
     * Calculate statistics from samples
     */
    private calculateStats(samples: PerformanceSample[]): PerformanceStats {
        if (samples.length === 0) {
            return {
                min: 0,
                max: 0,
                average: 0,
                median: 0,
                percentile95: 0,
                percentile99: 0,
                standardDeviation: 0,
                sampleCount: 0
            };
        }

        const values = samples.map(s => s.value).sort((a, b) => a - b);
        const count = values.length;

        const min = values[0];
        const max = values[count - 1];
        const sum = values.reduce((a, b) => a + b, 0);
        const average = sum / count;

        const median = count % 2 === 0
            ? (values[count / 2 - 1] + values[count / 2]) / 2
            : values[Math.floor(count / 2)];

        const percentile95 = values[Math.floor(count * 0.95)];
        const percentile99 = values[Math.floor(count * 0.99)];

        const squaredDiffs = values.map(v => Math.pow(v - average, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / count;
        const standardDeviation = Math.sqrt(variance);

        return {
            min,
            max,
            average,
            median,
            percentile95,
            percentile99,
            standardDeviation,
            sampleCount: count
        };
    }

    /**
     * Get statistics for metric
     */
    public getMetricStats(metric: MetricType): PerformanceStats | null {
        const samples = this.metricSamples.get(metric);
        if (!samples || samples.length === 0) return null;

        return this.calculateStats(samples);
    }

    /**
     * Get all metric stats
     */
    public getAllMetricStats(): Map<MetricType, PerformanceStats> {
        const stats = new Map<MetricType, PerformanceStats>();

        for (const [metric, samples] of this.metricSamples) {
            if (samples.length > 0) {
                stats.set(metric, this.calculateStats(samples));
            }
        }

        return stats;
    }

    /**
     * Generate performance report
     */
    public generateReport(): PerformanceReport {
        const metrics = this.getAllMetricStats();
        const recommendations = this.generateRecommendations(metrics);

        const report: PerformanceReport = {
            timestamp: Date.now(),
            duration: this.samplingInterval * this.maxSamples,
            metrics,
            issues: [...this.detectedIssues],
            benchmarks: [...this.completedBenchmarks],
            recommendations
        };

        return report;
    }

    /**
     * Generate performance recommendations
     */
    private generateRecommendations(metrics: Map<MetricType, PerformanceStats>): string[] {
        const recommendations: string[] = [];

        // FPS recommendations
        const fpsStats = metrics.get(MetricType.FPS);
        if (fpsStats && fpsStats.average < 30) {
            recommendations.push('Low FPS detected. Consider reducing graphics quality or optimizing scene complexity.');
        }

        // Draw calls
        const drawCallStats = metrics.get(MetricType.DRAW_CALLS);
        if (drawCallStats && drawCallStats.average > 1000) {
            recommendations.push('High draw call count. Consider batching meshes or using instancing.');
        }

        // Triangles
        const triangleStats = metrics.get(MetricType.TRIANGLES);
        if (triangleStats && triangleStats.average > 1000000) {
            recommendations.push('High triangle count. Implement LOD (Level of Detail) system or reduce mesh complexity.');
        }

        // Particles
        const particleStats = metrics.get(MetricType.PARTICLES);
        if (particleStats && particleStats.average > 50000) {
            recommendations.push('Too many particles. Reduce particle count or implement particle pooling.');
        }

        // Textures
        const textureStats = metrics.get(MetricType.TEXTURES);
        if (textureStats && textureStats.average > 100) {
            recommendations.push('High texture count. Consider texture atlasing or reducing texture resolution.');
        }

        // Memory
        const memoryStats = metrics.get(MetricType.MEMORY);
        if (memoryStats && memoryStats.average > 500) {
            recommendations.push('High memory usage. Check for memory leaks or reduce asset sizes.');
        }

        // Lights
        const lightStats = metrics.get(MetricType.LIGHTS);
        if (lightStats && lightStats.average > 8) {
            recommendations.push('Too many lights. Reduce light count or use baked lighting.');
        }

        return recommendations;
    }

    /**
     * Export profiling data
     */
    public exportData(): string {
        const data = {
            timestamp: Date.now(),
            metrics: Array.from(this.metricSamples.entries()).map(([type, samples]) => ({
                type,
                samples: samples.slice(-100), // Last 100 samples
                stats: this.calculateStats(samples)
            })),
            issues: this.detectedIssues,
            benchmarks: this.completedBenchmarks,
            markers: this.completedMarkers
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Clear all profiling data
     */
    public clearData(): void {
        this.metricSamples.clear();
        this.detectedIssues = [];
        this.completedBenchmarks = [];
        this.completedMarkers = [];
    }

    /**
     * Set threshold
     */
    public setThreshold(threshold: PerformanceThreshold): void {
        this.thresholds.set(threshold.metric, threshold);
    }

    /**
     * Get recent samples
     */
    public getRecentSamples(metric: MetricType, count: number = 60): PerformanceSample[] {
        const samples = this.metricSamples.get(metric);
        if (!samples) return [];

        return samples.slice(-count);
    }

    /**
     * Get active marker tree
     */
    public getMarkerTree(): ProfilerMarker[] {
        // Return only root markers
        return this.completedMarkers.filter(m => !m.parent);
    }

    /**
     * Subscribe to performance issues
     */
    public onPerformanceIssue(callback: (issue: PerformanceIssue) => void): void {
        this.onPerformanceIssueObservable.add(callback);
    }

    /**
     * Subscribe to metric samples
     */
    public onMetricSample(callback: (sample: PerformanceSample) => void): void {
        this.onMetricSampleObservable.add(callback);
    }

    /**
     * Enable/disable profiler
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;

        if (enabled && !this.samplingTimer) {
            this.startSampling();
        }
    }

    /**
     * Enable/disable detailed profiling
     */
    public setDetailedProfiling(enabled: boolean): void {
        this.detailedProfiling = enabled;
    }

    /**
     * Enable/disable auto reporting
     */
    public setAutoReporting(enabled: boolean, interval?: number): void {
        this.autoReporting = enabled;

        if (interval) {
            this.reportInterval = interval;
        }

        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = undefined;
        }

        if (enabled) {
            this.reportTimer = window.setInterval(() => {
                const report = this.generateReport();
                console.log('Performance Report:', report);
            }, this.reportInterval);
        }
    }

    /**
     * Get current FPS
     */
    public getCurrentFPS(): number {
        return this.engine.getFps();
    }

    /**
     * Get current frame time
     */
    public getCurrentFrameTime(): number {
        return this.sceneInstrumentation.frameTimeCounter.current;
    }

    /**
     * Get memory usage
     */
    public getMemoryUsage(): number {
        if ('memory' in performance && (performance as any).memory) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize / (1024 * 1024);
        }
        return 0;
    }

    /**
     * Take performance snapshot
     */
    public takeSnapshot(): PerformanceReport {
        return this.generateReport();
    }

    /**
     * Compare two snapshots
     */
    public compareSnapshots(snapshot1: PerformanceReport, snapshot2: PerformanceReport): {
        improvements: string[];
        regressions: string[];
    } {
        const improvements: string[] = [];
        const regressions: string[] = [];

        for (const [metric, stats2] of snapshot2.metrics) {
            const stats1 = snapshot1.metrics.get(metric);
            if (!stats1) continue;

            const diff = stats2.average - stats1.average;
            const percentChange = (diff / stats1.average) * 100;

            if (Math.abs(percentChange) > 5) { // 5% threshold
                if (metric === MetricType.FPS) {
                    if (diff > 0) {
                        improvements.push(`FPS improved by ${percentChange.toFixed(1)}%`);
                    } else {
                        regressions.push(`FPS decreased by ${Math.abs(percentChange).toFixed(1)}%`);
                    }
                } else {
                    if (diff < 0) {
                        improvements.push(`${metric} reduced by ${Math.abs(percentChange).toFixed(1)}%`);
                    } else {
                        regressions.push(`${metric} increased by ${percentChange.toFixed(1)}%`);
                    }
                }
            }
        }

        return { improvements, regressions };
    }

    /**
     * Dispose profiler
     */
    public dispose(): void {
        if (this.samplingTimer) {
            clearInterval(this.samplingTimer);
        }

        if (this.reportTimer) {
            clearInterval(this.reportTimer);
        }

        this.sceneInstrumentation.dispose();
        this.engineInstrumentation.dispose();

        this.metricSamples.clear();
        this.activeBenchmarks.clear();
        this.activeMarkers.clear();

        this.onPerformanceIssueObservable.clear();
        this.onMetricSampleObservable.clear();
    }
}
