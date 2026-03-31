import { z } from "zod";
declare function FirebaseTimestampType(FirebaseAdmin: any): z.ZodUnion<readonly [z.ZodCustom<any, any>, z.ZodDate, z.ZodCustom<unknown, unknown>]>;
export default FirebaseTimestampType;
