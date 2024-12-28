import{_ as a,c as e,a0 as i,o as d}from"./chunks/framework.DZKAnWaX.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.functiondetails.md","filePath":"api/extract-pg-schema.functiondetails.md"}'),r={name:"api/extract-pg-schema.functiondetails.md"};function s(p,t,n,c,h,l){return d(),e("div",null,t[0]||(t[0]=[i('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.functiondetails.html">FunctionDetails</a></p><h2 id="functiondetails-interface" tabindex="-1">FunctionDetails interface <a class="header-anchor" href="#functiondetails-interface" aria-label="Permalink to &quot;FunctionDetails interface&quot;">​</a></h2><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FunctionDetails</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PgType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;function&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>Extends:</strong> <a href="./extract-pg-schema.pgtype.html">PgType</a>&lt;&quot;function&quot;&gt;</p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th><p>Property</p></th><th><p>Modifiers</p></th><th><p>Type</p></th><th><p>Description</p></th></tr></thead><tbody><tr><td><p><a href="./extract-pg-schema.functiondetails.comment.html">comment</a></p></td><td></td><td><p>string | null</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.definition.html">definition</a></p></td><td></td><td><p>string</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.estimatedcost.html">estimatedCost</a></p></td><td></td><td><p>number</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.estimatedrows.html">estimatedRows</a></p></td><td></td><td><p>number | null</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.informationschemavalue.html">informationSchemaValue</a></p></td><td></td><td><p><a href="./extract-pg-schema.informationschemaroutine.html">InformationSchemaRoutine</a></p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.isleakproof.html">isLeakProof</a></p></td><td></td><td><p>boolean</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.issecuritydefiner.html">isSecurityDefiner</a></p></td><td></td><td><p>boolean</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.isstrict.html">isStrict</a></p></td><td></td><td><p>boolean</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.language.html">language</a></p></td><td></td><td><p>string</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.parallelsafety.html">parallelSafety</a></p></td><td></td><td><p>FunctionParallelSafety</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.parameters.html">parameters</a></p></td><td></td><td><p><a href="./extract-pg-schema.functionparameter.html">FunctionParameter</a>[]</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.returnsset.html">returnsSet</a></p></td><td></td><td><p>boolean</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.returntype.html">returnType</a></p></td><td></td><td><p>string | TableReturnType</p></td><td></td></tr><tr><td><p><a href="./extract-pg-schema.functiondetails.volatility.html">volatility</a></p></td><td></td><td><p>FunctionVolatility</p></td><td></td></tr></tbody></table>',7)]))}const f=a(r,[["render",s]]);export{m as __pageData,f as default};