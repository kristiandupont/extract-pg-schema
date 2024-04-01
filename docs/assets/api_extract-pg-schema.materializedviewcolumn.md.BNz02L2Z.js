import{_ as t,c as e,o as a,a2 as i}from"./chunks/framework.Cywv3uHa.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.materializedviewcolumn.md","filePath":"api/extract-pg-schema.materializedviewcolumn.md"}'),r={name:"api/extract-pg-schema.materializedviewcolumn.md"},d=i('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.materializedviewcolumn.html">MaterializedViewColumn</a></p><h2 id="materializedviewcolumn-interface" tabindex="-1">MaterializedViewColumn interface <a class="header-anchor" href="#materializedviewcolumn-interface" aria-label="Permalink to &quot;MaterializedViewColumn interface&quot;">​</a></h2><p>Column in a materialized view.</p><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaterializedViewColumn</span></span></code></pre></div><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th><p>Property</p></th><th><p>Modifiers</p></th><th><p>Type</p></th><th><p>Description</p></th></tr></thead><tbody><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.comment.html">comment</a></p></td><td></td><td><p>string | null</p></td><td><p>Comment on the column.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.defaultvalue.html">defaultValue</a></p></td><td></td><td><p>any</p></td><td><p>Default value of the column.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.expandedtype.html">expandedType</a></p></td><td></td><td><p>string</p></td><td><p>Expanded type name. If the type is an array, brackets will be appended to the type name.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.fakeinformationschemavalue.html">fakeInformationSchemaValue</a></p></td><td></td><td><p><a href="./extract-pg-schema.informationschemacolumn.html">InformationSchemaColumn</a></p></td><td><p>The Postgres information_schema views do not contain info about materialized views. This value is the result of a query that matches the one for regular views. Use with caution, not all fields are guaranteed to be meaningful and/or accurate.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.generated.html">generated</a></p></td><td></td><td><p>&quot;ALWAYS&quot; | &quot;NEVER&quot; | &quot;BY DEFAULT&quot;</p></td><td><p>Behavior of the generated column. &quot;ALWAYS&quot; if always generated, &quot;NEVER&quot; if never generated, &quot;BY DEFAULT&quot; if generated when a value is not provided.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.indices.html">indices?</a></p></td><td></td><td><p><a href="./extract-pg-schema.index.html">Index</a>[]</p></td><td><p><em>(Optional)</em></p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.isarray.html">isArray</a></p></td><td></td><td><p>boolean</p></td><td><p>Whether the column is an array.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.isidentity.html">isIdentity</a></p></td><td></td><td><p>boolean</p></td><td><p>Whether the column is an identity column.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.isnullable.html">isNullable?</a></p></td><td></td><td><p>boolean</p></td><td><p><em>(Optional)</em> Whether the column is nullable. This is only present if the view is resolved.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.isprimarykey.html">isPrimaryKey?</a></p></td><td></td><td><p>boolean</p></td><td><p><em>(Optional)</em> Whether the column is a primary key. This is only present if the view is resolved.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.isupdatable.html">isUpdatable</a></p></td><td></td><td><p>boolean</p></td><td><p>Whether the column is updatable.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.maxlength.html">maxLength</a></p></td><td></td><td><p>number | null</p></td><td><p>Maximum length of the column.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.name.html">name</a></p></td><td></td><td><p>string</p></td><td><p>Column name.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.ordinalposition.html">ordinalPosition</a></p></td><td></td><td><p>number</p></td><td><p>Ordinal position of the column in the view. Starts from 1.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.reference.html">reference?</a></p></td><td></td><td><p><a href="./extract-pg-schema.columnreference.html">ColumnReference</a> | null</p></td><td><p><em>(Optional)</em></p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.references.html">references?</a></p></td><td></td><td><p><a href="./extract-pg-schema.columnreference.html">ColumnReference</a>[]</p></td><td><p><em>(Optional)</em> If views are resolved, this will contain the references from the source column in the table that this view references. Note that if the source is another view, that view in turn will be resolved if possible, leading us to a table in the end.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.source.html">source?</a></p></td><td></td><td><p>{ schema: string; table: string; column: string; }</p></td><td><p><em>(Optional)</em> This will contain a &quot;link&quot; to the source table or view and column, if it can be determined.</p></td></tr><tr><td><p><a href="./extract-pg-schema.materializedviewcolumn.type.html">type</a></p></td><td></td><td><p><a href="./extract-pg-schema.materializedviewcolumntype.html">MaterializedViewColumnType</a></p></td><td><p>Type information.</p></td></tr></tbody></table>',7),p=[d];function n(l,o,m,h,c,s){return a(),e("div",null,p)}const g=t(r,[["render",n]]);export{f as __pageData,g as default};
