/**
 * Binary min-heap. Generic over T with a user-supplied comparator that
 * returns a negative number if `a` should come out first. Used by graph
 * pathfinding algorithms to replace O(V) linear scans of the open set
 * with O(log V) heap operations.
 *
 * Not a specialized indexed heap — duplicate insertions of the same node
 * are tolerated by the consumer (popping a stale entry is cheap and the
 * algorithm checks `isVisited` after each pop).
 */
export class MinHeap<T> {
  private readonly compare: (a: T, b: T) => number;
  private data: T[] = [];

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  get size(): number {
    return this.data.length;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  push(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  pop(): T | undefined {
    const { data } = this;
    if (data.length === 0) return undefined;
    const top = data[0];
    const last = data.pop()!;
    if (data.length > 0) {
      data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(i: number): void {
    const { data, compare } = this;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (compare(data[i], data[parent]) < 0) {
        [data[i], data[parent]] = [data[parent], data[i]];
        i = parent;
      } else {
        return;
      }
    }
  }

  private siftDown(i: number): void {
    const { data, compare } = this;
    const n = data.length;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && compare(data[left], data[smallest]) < 0) smallest = left;
      if (right < n && compare(data[right], data[smallest]) < 0) smallest = right;
      if (smallest === i) return;
      [data[i], data[smallest]] = [data[smallest], data[i]];
      i = smallest;
    }
  }
}
