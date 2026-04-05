function InitializeModel(opts) {
    const { collection: collectionName, schema, FirebaseAdmin } = opts;
    const db = FirebaseAdmin.firestore();
    const collection = db.collection(collectionName);
    function parseDoc(doc) {
        if (!doc.exists)
            return null;
        const result = schema.safeParse(doc.data());
        if (!result.success || typeof result.data !== "object" || result.data === null)
            return null;
        return {
            id: doc.id,
            ...result.data,
        };
    }
    function parseDocs(snapshot) {
        return snapshot.docs
            .map(parseDoc)
            .filter((doc) => doc !== null);
    }
    return {
        async all() {
            const snapshot = await collection.get();
            return parseDocs(snapshot);
        },
        async find(id) {
            const snapshot = await collection.doc(id).get();
            return parseDoc(snapshot);
        },
        async create(data, id) {
            const dataWithTimestamp = {
                ...data,
                createdAt: FirebaseAdmin.firestore.FieldValue.serverTimestamp(),
                updatedAt: FirebaseAdmin.firestore.FieldValue.serverTimestamp(),
            };
            const parsed = schema.parse(dataWithTimestamp);
            let docRef;
            if (id) {
                docRef = collection.doc(id);
                const existingDoc = await docRef.get();
                if (existingDoc.exists) {
                    throw new Error(`Document with ID ${id} already exists!`);
                }
                await docRef.set(parsed);
            }
            else {
                docRef = await collection.add(parsed);
            }
            const docSnap = await docRef.get();
            if (!docSnap.exists)
                return null;
            const result = schema.safeParse(docSnap.data());
            if (!result.success || typeof result.data !== "object" || result.data === null)
                return null;
            return {
                id: docSnap.id,
                ...result.data,
            };
        },
        async update(data, id) {
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
        async destroy(id) {
            await collection.doc(id).delete();
        },
        async where(conditions) {
            let query = collection;
            for (const [field, value] of Object.entries(conditions)) {
                query = query.where(field, "==", value);
            }
            const snapshot = await query.get();
            return parseDocs(snapshot);
        },
        async find_by(conditions) {
            let query = collection;
            for (const [field, value] of Object.entries(conditions)) {
                query = query.where(field, "==", value);
            }
            const snapshot = await query.limit(1).get();
            if (snapshot.empty)
                return null;
            return parseDoc(snapshot.docs[0]);
        },
    };
}
export default InitializeModel;
