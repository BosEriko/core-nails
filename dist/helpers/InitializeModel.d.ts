import { z, ZodObject, ZodRawShape } from "zod";
type WhereOperator = "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "not-in" | "array-contains-any";
type WhereCondition<T> = {
    field: keyof T;
    operator: WhereOperator;
    value: any;
};
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
    where(conditions: WhereCondition<z.core.output<TSchema>>[]): Promise<(z.core.output<TSchema> & {
        id: string;
    })[]>;
    find_by(conditions: WhereCondition<z.core.output<TSchema>>[]): Promise<(z.core.output<TSchema> & {
        id: string;
    }) | null>;
};
export default InitializeModel;
