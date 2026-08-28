export const zodFieldValidator = (schema) => ({ value }) => {
        const result = schema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
    };