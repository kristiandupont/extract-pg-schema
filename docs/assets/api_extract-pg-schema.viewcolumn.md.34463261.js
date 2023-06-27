import{_ as t,o as e,c as a,O as r}from"./chunks/framework.6d15b5d0.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.viewcolumn.md","filePath":"api/extract-pg-schema.viewcolumn.md"}'),d={name:"api/extract-pg-schema.viewcolumn.md"},n=r('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.viewcolumn.html">ViewColumn</a></p><h2 id="viewcolumn-interface" tabindex="-1">ViewColumn interface <a class="header-anchor" href="#viewcolumn-interface" aria-label="Permalink to &quot;ViewColumn interface&quot;">​</a></h2><p><strong>Signature:</strong></p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">export</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">interface</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ViewColumn</span></span></code></pre></div><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th>Property</th><th>Modifiers</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><a href="./extract-pg-schema.viewcolumn.comment.html">comment</a></td><td></td><td>string | null</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.defaultvalue.html">defaultValue</a></td><td></td><td>any</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.expandedtype.html">expandedType</a></td><td></td><td>string</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.generated.html">generated</a></td><td></td><td>&#39;ALWAYS&#39; | &#39;NEVER&#39; | &#39;BY DEFAULT&#39;</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.indices.html">indices?</a></td><td></td><td><a href="./extract-pg-schema.index.html">Index</a>[]</td><td><em>(Optional)</em></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.informationschemavalue.html">informationSchemaValue</a></td><td></td><td><a href="./extract-pg-schema.informationschemacolumn.html">InformationSchemaColumn</a></td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.isarray.html">isArray</a></td><td></td><td>boolean</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.isidentity.html">isIdentity</a></td><td></td><td>boolean</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.isnullable.html">isNullable?</a></td><td></td><td>boolean</td><td><em>(Optional)</em></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.isprimarykey.html">isPrimaryKey?</a></td><td></td><td>boolean</td><td><em>(Optional)</em></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.isupdatable.html">isUpdatable</a></td><td></td><td>boolean</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.maxlength.html">maxLength</a></td><td></td><td>number | null</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.name.html">name</a></td><td></td><td>string</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.ordinalposition.html">ordinalPosition</a></td><td></td><td>number</td><td></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.reference.html">reference?</a></td><td></td><td><a href="./extract-pg-schema.columnreference.html">ColumnReference</a> | null</td><td><em>(Optional)</em></td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.references.html">references?</a></td><td></td><td><a href="./extract-pg-schema.columnreference.html">ColumnReference</a>[]</td><td><em>(Optional)</em> If views are resolved, this will contain the references from the source column in the table that this view references. Note that if the source is another view, that view in turn will be resolved if possible, leading us to a table in the end.</td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.source.html">source</a></td><td></td><td>{ schema: string; table: string; column: string; } | null</td><td>This will contain a &quot;link&quot; to the source table or view and column, if it can be determined.</td></tr><tr><td><a href="./extract-pg-schema.viewcolumn.type.html">type</a></td><td></td><td><a href="./extract-pg-schema.viewcolumntype.html">ViewColumnType</a></td><td></td></tr></tbody></table>',6),c=[n];function l(i,o,m,s,h,p){return e(),a("div",null,c)}const g=t(d,[["render",l]]);export{f as __pageData,g as default};