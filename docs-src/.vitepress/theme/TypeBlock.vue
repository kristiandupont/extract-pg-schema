<script setup lang="ts">
import { computed, ref } from "vue";
import rawTypeData from "../../type-data.json";

interface PropertyInfo {
  name: string;
  typeText: string;
  comment: string | null;
  optional: boolean;
  deprecated: boolean;
}

interface TypeInfo {
  name: string;
  keyword: "interface" | "type";
  comment: string | null;
  properties: PropertyInfo[] | null;
  typeText: string | null;
  extendsTexts: string[];
}

const typeData = rawTypeData as Record<string, TypeInfo>;

const props = defineProps<{
  typeName: string;
  depth?: number;
}>();

const depth = computed(() => props.depth ?? 0);
const typeInfo = computed(() => typeData[props.typeName] ?? null);

// Track which property names are expanded (showing their referenced type inline)
const expanded = ref(new Set<string>());

function toggle(key: string) {
  const next = new Set(expanded.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expanded.value = next;
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

type TokenKind =
  | "kw"
  | "primitive"
  | "type-ref"
  | "string-lit"
  | "punct"
  | "ident";

interface Token {
  kind: TokenKind;
  text: string;
}

const PRIMITIVES = new Set([
  "string",
  "number",
  "boolean",
  "any",
  "void",
  "never",
  "unknown",
  "object",
  "symbol",
  "bigint",
]);
const KEYWORDS = new Set([
  "null",
  "undefined",
  "true",
  "false",
  "readonly",
  "keyof",
  "typeof",
  "infer",
  "extends",
  "in",
  "is",
  "asserts",
]);

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    // String literal (single or double quoted)
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== ch) {
        if (text[j] === "\\") j++;
        j++;
      }
      tokens.push({ kind: "string-lit", text: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < text.length && /[a-zA-Z0-9_$]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (PRIMITIVES.has(word)) tokens.push({ kind: "primitive", text: word });
      else if (KEYWORDS.has(word)) tokens.push({ kind: "kw", text: word });
      else if (typeData[word]) tokens.push({ kind: "type-ref", text: word });
      else tokens.push({ kind: "ident", text: word });
      i = j;
      continue;
    }

    tokens.push({ kind: "punct", text: ch });
    i++;
  }

  return tokens;
}

// Find the first known type name in a type text string
function firstTypeRef(typeText: string): string | null {
  for (const tok of tokenize(typeText)) {
    if (tok.kind === "type-ref") return tok.text;
  }
  return null;
}

// Extract the base identifier from an extends clause like `PgType<"table">` → `PgType`
function extendsBaseRef(extendsText: string): string | null {
  return firstTypeRef(extendsText);
}
</script>

<template>
  <div class="tb" :class="[`tb--d${depth}`, depth > 0 ? 'tb--nested' : '']">
    <template v-if="typeInfo">
      <!-- Block-level comment — on one line to avoid whitespace condensing -->
      <div v-if="typeInfo.comment && depth === 0" class="tb-block-comment">/** {{ typeInfo.comment }} */</div>

      <!-- ── Header line ─────────────────────────────── -->
      <div class="tb-line tb-header">
        <template v-if="depth === 0"><span class="tb-kw">export</span>{{" "}}</template><span class="tb-kw">{{ typeInfo.keyword }}</span>{{" "}}<span class="tb-self-name">{{ typeInfo.name }}</span>

        <!-- extends clause -->
        <template v-if="typeInfo.extendsTexts.length">
          {{" "}}<span class="tb-kw">extends</span>{{" "}}
          <template
            v-for="(ext, ei) in typeInfo.extendsTexts"
            :key="ext"
          >
            <template v-if="ei > 0"><span class="tb-punct">,</span>{{" "}}</template>
            <template v-for="(tok, ti) in tokenize(ext)" :key="ti">
              <span :class="`tb-${tok.kind}`">{{ tok.text }}</span>
            </template>
            <button
              v-if="extendsBaseRef(ext)"
              class="tb-btn"
              :title="
                expanded.has(`__extends_${ei}`)
                  ? 'Collapse'
                  : `Expand ${extendsBaseRef(ext)}`
              "
              @click="toggle(`__extends_${ei}`)"
            >{{ expanded.has(`__extends_${ei}`) ? "▼" : "▶" }}</button>
          </template>
        </template>

        <!-- = for type aliases / { for interfaces -->
        <template v-if="typeInfo.keyword === 'type' && !typeInfo.properties">{{" "}}<span class="tb-punct">=</span></template>
        <template v-else-if="typeInfo.properties">{{" "}}<span class="tb-punct">{</span></template>
      </div>

      <!-- Expanded extends types -->
      <template
        v-for="(ext, ei) in typeInfo.extendsTexts"
        :key="`ext-expanded-${ei}`"
      >
        <div v-if="expanded.has(`__extends_${ei}`) && extendsBaseRef(ext)" class="tb-child">
          <TypeBlock
            :type-name="extendsBaseRef(ext)!"
            :depth="depth + 1"
          />
        </div>
      </template>

      <!-- ── Interface / object-type body ───────────── -->
      <template v-if="typeInfo.properties">
        <div v-for="prop in typeInfo.properties" :key="prop.name" class="tb-prop-group">
          <!-- JSDoc comment — all on one line to avoid whitespace condensing -->
          <div v-if="prop.comment" class="tb-line tb-prop-comment tb-indented">// {{ prop.comment }}</div>

          <!-- Property line — kept on one line intentionally -->
          <!-- prettier-ignore -->
          <div class="tb-line tb-prop-line tb-indented"><span class="tb-prop-name" :class="{ 'tb-deprecated': prop.deprecated }">{{ prop.name }}</span><template v-if="prop.optional"><span class="tb-punct">?</span></template><span class="tb-punct">:</span>{{" "}}<template v-for="(tok, ti) in tokenize(prop.typeText)" :key="ti"><span :class="`tb-${tok.kind}`">{{ tok.text }}</span></template><button v-if="firstTypeRef(prop.typeText)" class="tb-btn" :title="expanded.has(prop.name) ? 'Collapse' : `Expand ${firstTypeRef(prop.typeText)}`" @click="toggle(prop.name)">{{ expanded.has(prop.name) ? "▼" : "▶" }}</button></div>

          <!-- Inline expanded child type -->
          <div v-if="expanded.has(prop.name) && firstTypeRef(prop.typeText)" class="tb-child">
            <TypeBlock :type-name="firstTypeRef(prop.typeText)!" :depth="depth + 1" />
          </div>
        </div>

        <!-- Closing brace -->
        <div class="tb-line tb-footer"><span class="tb-punct">}</span></div>
      </template>

      <!-- ── Type alias body (non-object) ───────────── -->
      <!-- prettier-ignore -->
      <div v-else-if="typeInfo.typeText" class="tb-line tb-indented"><template v-for="(tok, ti) in tokenize(typeInfo.typeText)" :key="ti"><span :class="`tb-${tok.kind}`">{{ tok.text }}</span></template></div>
    </template>

    <div v-else class="tb-error">
      Unknown type: <code>{{ typeName }}</code>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ──────────────────────────────────────────── */
.tb {
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 1.7;
  background: var(--vp-code-block-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
  overflow-x: auto;
}

.tb--nested {
  background: transparent;
  border: none;
  border-left: 2px solid var(--vp-c-divider);
  border-radius: 0;
  padding: 2px 0 2px 16px;
  margin: 4px 0 4px 8px;
}

/* ── Lines ──────────────────────────────────────────────── */
.tb-line {
  white-space: pre;
  display: block;
}

.tb-prop-group {
  /* groups a comment + property + optional child */
}

.tb-child {
  /* wrapper for inline-expanded child TypeBlock */
}

/* ── Syntax colours ─────────────────────────────────────── */
/* keywords: export, interface, type, extends, null … */
.tb-kw       { color: #569cd6; }
/* primitive types: string, number, boolean … */
.tb-primitive { color: #4ec9b0; }
/* interface/type name in the header */
.tb-self-name { color: #4ec9b0; font-weight: 600; }
/* type references: names that exist in typeData */
.tb-type-ref  { color: #4ec9b0; }
/* plain identifiers (not in typeData) */
.tb-ident     { color: var(--vp-c-text-1); }
/* string literals like "table" */
.tb-string-lit { color: #ce9178; }
/* punctuation: { } [ ] : ; | & , < > */
.tb-punct      { color: var(--vp-c-text-2); }
/* property names */
.tb-prop-name  { color: #9cdcfe; }
.tb-prop-name.tb-deprecated {
  text-decoration: line-through;
  opacity: 0.45;
}
/* comments */
.tb-block-comment,
.tb-prop-comment { color: #6a9955; font-style: normal; }

/* 2-character indent via CSS so whitespace spans are not needed */
.tb-indented { padding-left: 2ch; }

/* ── Expand / collapse button ───────────────────────────── */
.tb-btn {
  display: inline-block;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 3px;
  cursor: pointer;
  color: var(--vp-c-brand-1);
  font-size: 9px;
  line-height: 1;
  padding: 1px 4px;
  margin-left: 6px;
  vertical-align: middle;
  opacity: 0.75;
  transition: opacity 0.15s, border-color 0.15s;
}
.tb-btn:hover {
  opacity: 1;
  border-color: var(--vp-c-brand-1);
}

/* ── Light mode overrides ───────────────────────────────── */
:root:not(.dark) .tb-kw        { color: #0000ff; }
:root:not(.dark) .tb-primitive { color: #267f99; }
:root:not(.dark) .tb-self-name { color: #267f99; }
:root:not(.dark) .tb-type-ref  { color: #267f99; }
:root:not(.dark) .tb-string-lit { color: #a31515; }
:root:not(.dark) .tb-prop-name  { color: #001080; }
:root:not(.dark) .tb-block-comment,
:root:not(.dark) .tb-prop-comment { color: #008000; }

/* ── Error state ────────────────────────────────────────── */
.tb-error { color: var(--vp-c-danger-1); }
</style>
