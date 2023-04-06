import{_ as t,c as e,o as a,N as s}from"./chunks/framework.2bebdaf8.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.extractschemaoptions.md"}'),o={name:"api/extract-pg-schema.extractschemaoptions.md"},r=s(`<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.extractschemaoptions.html">ExtractSchemaOptions</a></p><h2 id="extractschemaoptions-interface" tabindex="-1">ExtractSchemaOptions interface <a class="header-anchor" href="#extractschemaoptions-interface" aria-label="Permalink to &quot;ExtractSchemaOptions interface&quot;">​</a></h2><p>This is the options object that can be passed to <code>extractSchemas</code>.</p><p><strong>Signature:</strong></p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">export</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">interface</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ExtractSchemaOptions</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"></span></code></pre></div><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th>Property</th><th>Modifiers</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><a href="./extract-pg-schema.extractschemaoptions.onprogress.html">onProgress?</a></td><td></td><td>() =&gt; void</td><td><em>(Optional)</em> Called once for each type that is extracted.</td></tr><tr><td><a href="./extract-pg-schema.extractschemaoptions.onprogressend.html">onProgressEnd?</a></td><td></td><td>() =&gt; void</td><td><em>(Optional)</em> Called when all types have been extracted.</td></tr><tr><td><a href="./extract-pg-schema.extractschemaoptions.onprogressstart.html">onProgressStart?</a></td><td></td><td>(total: number) =&gt; void</td><td><em>(Optional)</em> Called with the number of types to extract.</td></tr><tr><td><a href="./extract-pg-schema.extractschemaoptions.resolveviews.html">resolveViews?</a></td><td></td><td>boolean</td><td><em>(Optional)</em> extractShemas will always attempt to parse view definitions to discover the &quot;source&quot; of each column, i.e. the table or view that it is derived from. If this option is set to <code>true</code>, it will attempt to follow this source and copy values like indices, isNullable, etc. so that the view data is closer to what the database reflects.</td></tr><tr><td><a href="./extract-pg-schema.extractschemaoptions.schemas.html">schemas?</a></td><td></td><td>string[]</td><td><em>(Optional)</em> Will contain an array of schema names to extract. If undefined, all non-system schemas will be extracted.</td></tr><tr><td><a href="./extract-pg-schema.extractschemaoptions.typefilter.html">typeFilter?</a></td><td></td><td>(pgType: <a href="./extract-pg-schema.pgtype.html">PgType</a>) =&gt; boolean</td><td><em>(Optional)</em> Filter function that you can use if you want to exclude certain items from the schemas.</td></tr></tbody></table>`,7),c=[r];function n(i,p,h,d,l,m){return a(),e("div",null,c)}const g=t(o,[["render",n]]);export{f as __pageData,g as default};