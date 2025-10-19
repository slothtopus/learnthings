import type { PersistableObject } from "../PersistableObject";
import { ObjectManager } from "../ObjectManager";

export const pause = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const getDocs = async (db: PouchDB.Database<{ _id: string }>) => {
  return (await db.allDocs({ include_docs: true })).rows
    .map((d) => d.doc)
    .filter((d) => d !== undefined && !String(d._id).startsWith("_design"));
};

export const logDocs = async (db: PouchDB.Database<{ _id: string }>) => {
  const docs = await getDocs(db);
  console.log("\n>>>>>>>>> ALL DOCS");
  console.log(JSON.stringify(docs, null, 2));
  console.log("\n>>>>>>>>> ALL DOCS END");
  return docs;
};

let lastSeq = 1;
export const getChanges = async (
  db: PouchDB.Database<{ _id: string }>,
  reset = false
) => {
  if (reset) {
    lastSeq = 1;
  }
  const changes = await db.changes({
    since: lastSeq,
  });
  lastSeq = parseInt(String(changes.last_seq));
  return changes.results;
};

export const objToString = (obj: PersistableObject<any>) => {
  const details = [
    `hasChanged=${obj.hasChanged()}`,
    `isOrphaned=${obj.isOrphaned()}`,
    `isUnsaved=${obj.isUnsaved()}`,
    `isEmbedded=${obj.isEmbedded()}`,
    `shouldPersist=${obj.shouldPersist()}`,
    `shouldDelete=${obj.shouldDelete()}`,
  ];
  return `${obj.doctype}: ${obj.id} (${details.join(", ")})`;
};

export class ChangesLogger {
  om: ObjectManager;
  doctypeMap: Record<string, string> = {};

  constructor(om: ObjectManager) {
    this.om = om;
    this.updateDoctypeMap();
  }

  updateDoctypeMap() {
    Object.assign(
      this.doctypeMap,
      this.om.getAllObjects().reduce((doctypeMap, obj) => {
        doctypeMap[obj.id] = obj.doctype;
        return doctypeMap;
      }, {} as Record<string, string>)
    );
  }

  async getDoctypeChanges(reset = false) {
    this.updateDoctypeMap();
    const changes = await getChanges(this.om.getDB());
    return changes.map((c) => ({ ...c, doctype: this.doctypeMap[c.id] }));
  }
}
