import{_ as e,c as a,a0 as i,o as r}from"./chunks/framework.DZKAnWaX.js";const l=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.informationschemaview.md","filePath":"api/extract-pg-schema.informationschemaview.md"}'),s={name:"api/extract-pg-schema.informationschemaview.md"};function n(o,t,h,p,d,c){return r(),a("div",null,t[0]||(t[0]=[i('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.informationschemaview.html">InformationSchemaView</a></p><h2 id="informationschemaview-interface" tabindex="-1">InformationSchemaView interface <a class="header-anchor" href="#informationschemaview-interface" aria-label="Permalink to &quot;InformationSchemaView interface&quot;">​</a></h2><p>The view tables contains all tables and views defined in the current database. Only those tables and views are shown that the current user has access to (by way of being the owner or having some privilege).</p><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InformationSchemaView</span></span></code></pre></div><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th><p>Property</p></th><th><p>Modifiers</p></th><th><p>Type</p></th><th><p>Description</p></th></tr></thead><tbody><tr><td><p><a href="./extract-pg-schema.informationschemaview.check_option.html">check_option</a></p></td><td></td><td><p>&quot;CASCADED&quot; | &quot;LOCAL&quot; | &quot;NONE&quot;</p></td><td><p>CASCADED or LOCAL if the view has a CHECK OPTION defined on it, NONE if not</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.is_insertable_into.html">is_insertable_into</a></p></td><td></td><td><p><a href="./extract-pg-schema.yesno.html">YesNo</a></p></td><td><p>YES if the table is insertable into, NO if not (Base tables are always insertable into, views not necessarily.)</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.is_trigger_deletable.html">is_trigger_deletable</a></p></td><td></td><td><p><a href="./extract-pg-schema.yesno.html">YesNo</a></p></td><td><p>YES if the view has an INSTEAD OF DELETE trigger defined on it, NO if not</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.is_trigger_insertable_into.html">is_trigger_insertable_into</a></p></td><td></td><td><p><a href="./extract-pg-schema.yesno.html">YesNo</a></p></td><td><p>YES if the view has an INSTEAD OF INSERT trigger defined on it, NO if not</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.is_trigger_updatable.html">is_trigger_updatable</a></p></td><td></td><td><p><a href="./extract-pg-schema.yesno.html">YesNo</a></p></td><td><p>YES if the view has an INSTEAD OF UPDATE trigger defined on it, NO if not</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.is_updatable.html">is_updatable</a></p></td><td></td><td><p><a href="./extract-pg-schema.yesno.html">YesNo</a></p></td><td><p>ES if the view is updatable (allows UPDATE and DELETE), NO if not</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.table_catalog.html">table_catalog</a></p></td><td></td><td><p>string</p></td><td><p>Name of the database that contains the table (always the current database)</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.table_name.html">table_name</a></p></td><td></td><td><p>string</p></td><td><p>Name of the table</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.table_schema.html">table_schema</a></p></td><td></td><td><p>string</p></td><td><p>Name of the schema that contains the table</p></td></tr><tr><td><p><a href="./extract-pg-schema.informationschemaview.view_definition.html">view_definition</a></p></td><td></td><td><p>string</p></td><td><p>Query expression defining the view (null if the view is not owned by a currently enabled role)</p></td></tr></tbody></table>',7)]))}const f=e(s,[["render",n]]);export{l as __pageData,f as default};
