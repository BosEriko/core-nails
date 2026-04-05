import { z, ZodObject, ZodRawShape } from "zod";
type WhereCondition<T> = Partial<Record<keyof T, any>>;
declare function InitializeModel<TSchema extends ZodObject<ZodRawShape>>(opts: {
    collection: string;
    schema: TSchema;
    FirebaseAdmin: any;
}): {
    all(): Promise<(z.core.output<TSchema> & {
        id: string;
    })[]>;
    find(id: string): Promise<(z.core.output<TSchema> & {
        id: string;
    }) | null>;
    create(data: z.core.output<TSchema>, id?: string): Promise<(z.core.output<TSchema> & {
        id: string;
    }) | null>;
    update(data: Partial<z.core.output<TSchema>>, id: string): Promise<void>;
    destroy(id: string): Promise<void>;
    where(conditions: WhereCondition<z.core.output<TSchema>>): Promise<(z.core.output<TSchema> & {
        id: string;
    })[]>;
    find_by(conditions: WhereCondition<z.core.output<TSchema>>): Promise<(z.core.output<TSchema> & {
        id: string;
    }) | null>;
};
export default InitializeModel;
