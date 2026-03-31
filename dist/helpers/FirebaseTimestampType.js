import { z } from "zod";
function FirebaseTimestampType(FirebaseAdmin) {
    return z.union([
        z.instanceof(FirebaseAdmin.firestore.Timestamp),
        z.date(),
        z.custom((val) => val === FirebaseAdmin.firestore.FieldValue.serverTimestamp(), { message: "Expected serverTimestamp()" }),
    ]);
}
export default FirebaseTimestampType;
