import{_ as t,c as s,o as a,V as i}from"./chunks/framework.8nmKTlMA.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.extractschemas.md","filePath":"api/extract-pg-schema.extractschemas.md"}'),e={name:"api/extract-pg-schema.extractschemas.md"},h=i('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.extractschemas.html">extractSchemas</a></p><h2 id="extractschemas-function" tabindex="-1">extractSchemas() function <a class="header-anchor" href="#extractschemas-function" aria-label="Permalink to &quot;extractSchemas() function&quot;">​</a></h2><p>Perform the extraction</p><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> extractSchemas</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">connectionConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConnectionConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ExtractSchemaOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&gt;;</span></span></code></pre></div><h2 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h2><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td>connectionConfig</td><td>string | ConnectionConfig</td><td>Connection string or configuration object for Postgres connection</td></tr><tr><td>options</td><td><a href="./extract-pg-schema.extractschemaoptions.html">ExtractSchemaOptions</a></td><td><em>(Optional)</em> Optional options</td></tr></tbody></table><p><strong>Returns:</strong></p><p>Promise&lt;Record&lt;string, <a href="./extract-pg-schema.schema.html">Schema</a>&gt;&gt;</p><p>A record of all the schemas extracted, indexed by schema name.</p>',10),n=[h];function r(c,p,o,l,k,d){return a(),s("div",null,n)}const E=t(e,[["render",r]]);export{m as __pageData,E as default};