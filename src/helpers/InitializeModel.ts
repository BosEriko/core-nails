import { z, ZodObject, ZodRawShape } from "zod";

type WhereCondition<T> = Partial<Record<keyof T, any>>;

function InitializeModel<TSchema extends ZodObject<ZodRawShape>>(opts: {
  collection: string;
  schema: TSchema;
  FirebaseAdmin: any;
}) {
  const { collection: collectionName, schema, FirebaseAdmin } = opts;

  type T = z.infer<TSchema>;
  type WithId = T & { id: string };

  const db = FirebaseAdmin.firestore();
  const collection = db.collection(process.env.COLLECTION_SCOPE ? `${process.env.COLLECTION_SCOPE}__${collectionName}` : collectionName);

  function parseDoc(doc: any): WithId | null {
    if (!doc.exists) return null;

    const result = schema.safeParse(doc.data());

    if (!result.success || typeof result.data !== "object" || result.data === null) return null;

    return {
      id: doc.id,
      ...result.data,
    };
  }

  function parseDocs(
    snapshot: any
  ): WithId[] {
    return snapshot.docs
      .map(parseDoc)
      .filter((doc: WithId | null): doc is WithId => doc !== null);
  }

  return {
    async all(): Promise<WithId[]> {
      const snapshot = await collection.get();
      return parseDocs(snapshot);
    },

    async find(id: string): Promise<WithId | null> {
      const snapshot = await collection.doc(id).get();
      return parseDoc(snapshot);
    },

    async create(data: T, id?: string): Promise<WithId | null> {
      const dataWithTimestamp = {
        ...data,
        createdAt: FirebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: FirebaseAdmin.firestore.FieldValue.serverTimestamp(),
      };

      const parsed = schema.parse(dataWithTimestamp) as any;

      let docRef: any;

      if (id) {
        docRef = collection.doc(id);

        const existingDoc = await docRef.get();
        if (existingDoc.exists) {
          throw new Error(`Document with ID ${id} already exists!`);
        }

        await docRef.set(parsed);
      } else {
        docRef = await collection.add(parsed);
      }

      const docSnap = await docRef.get();
      if (!docSnap.exists) return null;

      const result = schema.safeParse(docSnap.data());
      if (!result.success || typeof result.data !== "object" || result.data === null) return null;

      return {
        id: docSnap.id,
        ...result.data,
      };
    },

    async update(data: Partial<T>, id: string): Promise<void> {
      if ("createdAt" in data) {
        throw new Error("Cannot modify createdAt field");
      }

      const dataWithTimestamp = {
        ...data,
        updatedAt: FirebaseAdmin.firestore.FieldValue.serverTimestamp(),
      };

      const partialSchema = schema.partial();
      const parsed = partialSchema.parse(dataWithTimestamp);

      await collection.doc(id).update(parsed);
    },

    async destroy(id: string): Promise<void> {
      await collection.doc(id).delete();
    },

    async where(conditions: WhereCondition<T>): Promise<WithId[]> {
      let query: any = collection;

      for (const [field, value] of Object.entries(conditions)) {
        query = query.where(field, "==", value);
      }

      const snapshot = await query.get();
      return parseDocs(snapshot);
    },

    async find_by(conditions: WhereCondition<T>): Promise<WithId | null> {
      let query: any = collection;

      for (const [field, value] of Object.entries(conditions)) {
        query = query.where(field, "==", value);
      }

      const snapshot = await query.limit(1).get();

      if (snapshot.empty) return null;

      return parseDoc(snapshot.docs[0]);
    },
  };
}

export default InitializeModel;
