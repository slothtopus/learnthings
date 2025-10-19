import type { ObjectManager } from "./ObjectManager";
import type { PersistableObject } from "./PersistableObject";

export class TransactionGraphV4 {
  objects: PersistableObject<any>[];
  om: ObjectManager;

  constructor(objects: PersistableObject<any>[], om: ObjectManager) {
    this.objects = objects;
    this.om = om;

    this.buildGraph();
  }

  // Object with root id K is related (i.e. dependent on) objs with root id V
  edgesSet: Record<string, Set<string>> = {};
  invertedEdgesSet: Record<string, Set<string>> = {};
  nodesSet = new Set<string>();

  buildGraph() {
    for (const obj of this.objects) {
      this.addToGraph(obj);
    }
  }

  mapIdToRoot(id: string) {
    return this.om.getObjectById(id).rootId;
  }

  addToGraph(obj: PersistableObject<any>) {
    const objRootId = obj.rootId;
    this.nodesSet.add(objRootId);

    for (const relatedId of obj.relatedIds) {
      const relatedRootId = this.mapIdToRoot(relatedId);
      if (objRootId !== relatedRootId) {
        this.edgesSet[objRootId] = (
          this.edgesSet[objRootId] ?? new Set<string>()
        ).add(relatedRootId);
        this.invertedEdgesSet[relatedRootId] = (
          this.invertedEdgesSet[relatedRootId] ?? new Set<string>()
        ).add(objRootId);
      }
      this.addToGraph(this.om.getObjectById(relatedId));
    }
  }

  // How far rootId K is from initial root (deck)
  assignLevels(inverted = false) {
    const levels: Record<string, number> = {};
    for (const id of this.nodesSet.values()) {
      this.assignLevel(id, 0, levels, inverted);
    }

    return levels;
  }

  assignLevel(
    id: string,
    level: number,
    levels: Record<string, number>,
    inverted = false
  ) {
    const existingLevel = levels[id];
    if (existingLevel === undefined || existingLevel < level) {
      levels[id] = level;
    }

    const edges = inverted ? this.invertedEdgesSet[id] : this.edgesSet[id];
    if (edges) {
      edges.values().forEach((nextId) => {
        this.assignLevel(nextId, level + 1, levels, inverted);
      });
    }
  }

  // Formatted for Flourish
  // https://app.flourish.studio/visualisation/24186890/edit
  printGraph() {
    const levels = this.assignLevels(true);
    const rootIdOps = new Set(this.objects.map((o) => o.rootId));
    const idToString = (id: string) =>
      `${rootIdOps.has(id) ? "*" : ""}${levels[id]}:${this.om
        .getObjectById(id)
        .toString()}`;

    console.log("-------------------------------------------------");
    console.log("> Nodes");
    this.nodesSet.values().forEach((n) => console.log(idToString(n)));

    const edgesLeft: string[] = [];
    const edgesRight: string[] = [];
    Object.entries(this.edgesSet).forEach(([sourceId, targetIdSet]) => {
      targetIdSet.values().forEach((targetId) => {
        edgesLeft.push(idToString(sourceId));
        edgesRight.push(idToString(targetId));
      });
    });

    console.log("\n> Edges left");
    edgesLeft.forEach((e) => console.log(e));

    console.log("\n> Edges right");
    edgesRight.forEach((e) => console.log(e));

    console.log("-------------------------------------------------");
  }
}
