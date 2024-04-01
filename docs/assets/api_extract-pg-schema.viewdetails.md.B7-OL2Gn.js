import{_ as t,c as e,o as a,a2 as i}from"./chunks/framework.Cywv3uHa.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.viewdetails.md","filePath":"api/extract-pg-schema.viewdetails.md"}'),s={name:"api/extract-pg-schema.viewdetails.md"},p=i('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.viewdetails.html">ViewDetails</a></p><h2 id="viewdetails-interface" tabindex="-1">ViewDetails interface <a class="header-anchor" href="#viewdetails-interface" aria-label="Permalink to &quot;ViewDetails interface&quot;">​</a></h2><p>View in a schema.</p><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ViewDetails</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PgType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;view&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>Extends:</strong> <a href="./extract-pg-schema.pgtype.html">PgType</a>&lt;&quot;view&quot;&gt;</p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th><p>Property</p></th><th><p>Modifiers</p></th><th><p>Type</p></th><th><p>Description</p></th></tr></thead><tbody><tr><td><p><a href="./extract-pg-schema.viewdetails.columns.html">columns</a></p></td><td></td><td><p><a href="./extract-pg-schema.viewcolumn.html">ViewColumn</a>[]</p></td><td><p>Columns in the view.</p></td></tr><tr><td><p><a href="./extract-pg-schema.viewdetails.definition.html">definition</a></p></td><td></td><td><p>string</p></td><td><p>The SQL definition of the view.</p></td></tr><tr><td><p><a href="./extract-pg-schema.viewdetails.informationschemavalue.html">informationSchemaValue</a></p></td><td></td><td><p><a href="./extract-pg-schema.informationschemaview.html">InformationSchemaView</a></p></td><td><p>Information schema value for the view.</p></td></tr></tbody></table>',8),r=[p];function h(n,d,l,o,c,m){return a(),e("div",null,r)}const k=t(s,[["render",h]]);export{f as __pageData,k as default};
