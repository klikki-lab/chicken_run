export class PointEventQueue {

    private queue: g.PointEvent[];

    constructor() {
        this.clear();
    }

    push(event: g.PointEvent): void { this.queue.push(event); }

    pop(): g.PointEvent | undefined { return this.queue.shift(); }

    clear(): void { this.queue = []; }

    isEmpty(): boolean { return this.queue.length === 0; }

    length(): number { return this.queue.length; }
}