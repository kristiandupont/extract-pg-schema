import { Node, Project } from "ts-morph";
import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

export interface PropertyInfo {
  name: string;
  typeText: string;
  comment: string | null;
  optional: boolean;
  deprecated: boolean;
}

export interface TypeInfo {
  name: string;
  /** The keyword used in the source: "interface" or "type" */
  keyword: "interface" | "type";
  comment: string | null;
  /** Non-null for interface and object-literal type aliases */
  properties: PropertyInfo[] | null;
  /** Non-null for non-object type aliases (unions, intersections, etc.) */
  typeText: string | null;
  extendsTexts: string[];
}

export type TypeData = Record<string, TypeInfo>;

const project = new Project({
  tsConfigFilePath: resolve(rootDir, "tsconfig.json"),
});

const typeData: TypeData = {};

function extractComment(
  jsDocs: { getDescription: () => string }[],
): string | null {
  if (!jsDocs.length) return null;
  const desc = jsDocs[0].getDescription().trim();
  return desc || null;
}

function isDeprecated(
  jsDocs: { getTags: () => { getTagName: () => string }[] }[],
): boolean {
  return jsDocs.some((d) =>
    d.getTags().some((t) => t.getTagName() === "deprecated"),
  );
}

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  if (!filePath.includes("/src/")) continue;
  if (filePath.includes(".test.")) continue;

  // Exported interfaces
  for (const iface of sourceFile.getInterfaces()) {
    if (!iface.isExported()) continue;
    const name = iface.getName();
    const jsDocs = iface.getJsDocs();

    typeData[name] = {
      name,
      keyword: "interface",
      comment: extractComment(jsDocs),
      extendsTexts: iface.getExtends().map((e) => e.getText()),
      properties: iface.getProperties().map((prop) => ({
        name: prop.getName(),
        typeText:
          prop.getTypeNode()?.getText() ?? prop.getType().getText(prop),
        comment: prop.getJsDocs()[0]?.getDescription().trim() || null,
        optional: prop.hasQuestionToken(),
        deprecated: isDeprecated(prop.getJsDocs()),
      })),
      typeText: null,
    };
  }

  // Exported type aliases
  for (const typeAlias of sourceFile.getTypeAliases()) {
    if (!typeAlias.isExported()) continue;
    const name = typeAlias.getName();
    const jsDocs = typeAlias.getJsDocs();
    const typeNode = typeAlias.getTypeNode();

    // Object type literals get the same property treatment as interfaces
    if (typeNode && Node.isTypeLiteral(typeNode)) {
      typeData[name] = {
        name,
        keyword: "type",
        comment: extractComment(jsDocs),
        extendsTexts: [],
        properties: typeNode.getProperties().map((prop) => ({
          name: prop.getName(),
          typeText:
            prop.getTypeNode()?.getText() ?? prop.getType().getText(prop),
          comment: prop.getJsDocs()[0]?.getDescription().trim() || null,
          optional: prop.hasQuestionToken(),
          deprecated: isDeprecated(prop.getJsDocs()),
        })),
        typeText: null,
      };
    } else {
      typeData[name] = {
        name,
        keyword: "type",
        comment: extractComment(jsDocs),
        extendsTexts: [],
        properties: null,
        typeText: typeNode?.getText() ?? typeAlias.getType().getText(),
      };
    }
  }
}

const outputPath = resolve(__dirname, "type-data.json");
writeFileSync(outputPath, JSON.stringify(typeData, null, 2));
console.log(
  `Generated type data for ${Object.keys(typeData).length} types → ${outputPath}`,
);
