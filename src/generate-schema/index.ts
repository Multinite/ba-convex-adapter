import type { BetterAuthPlugin } from "better-auth";
import { getConvexSchema } from "./get-convex-schema";
import { generateImportStage } from "./generate-imports";
import { generateSchemaBuilderStage } from "./generate-schema-builder";

const defineSchema = `export default defineSchema({`;
const defineSchemaEnd = `});`;

export const generateSchema = async (
	plugins: BetterAuthPlugin[],
	options: { indent?: number; convex_dir_path: string } = {
		convex_dir_path: "./convex",
	},
): Promise<string> => {
	const { indent = 2, convex_dir_path } = options;

	const existing_schema_code: string = await getConvexSchema(convex_dir_path);

	// Step 1. Ensure that the imports are present
	let code: string = generateImportStage(existing_schema_code);
	// Step 2. Add scham code to the defineSchema export
	code = generateSchemaBuilderStage({ code, indent, plugins });

	return code;
};