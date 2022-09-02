import{_ as s,c as a,o as n,a as e}from"./app.4cb370b5.js";const A=JSON.parse('{"title":"extractSchema variable","description":"","frontmatter":{},"headers":[{"level":2,"title":"extractSchema variable","slug":"extractschema-variable"}],"relativePath":"api/extract-pg-schema.extractschema.md"}'),l={name:"api/extract-pg-schema.extractschema.md"},p=e(`<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.extractschema.html">extractSchema</a></p><h2 id="extractschema-variable" tabindex="-1">extractSchema variable <a class="header-anchor" href="#extractschema-variable" aria-hidden="true">#</a></h2><blockquote><p>Warning: This API is now obsolete.</p><ul><li>use extractSchemas instead</li></ul></blockquote><p><b>Signature:</b></p><div class="language-typescript"><span class="copy"></span><pre><code><span class="line"><span style="color:#FFCB6B;">extractSchema</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">schemaName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> connectionConfig</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ConnectionConfig</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> resolveViews</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">boolean</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> tables</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span><span style="color:#A6ACCD;">[]</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Promise</span><span style="color:#89DDFF;">&lt;{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">tables</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">any</span><span style="color:#A6ACCD;">[]</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">views</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">any</span><span style="color:#A6ACCD;">[]</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">types</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">any</span><span style="color:#A6ACCD;">[]</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}&gt;</span></span>
<span class="line"></span></code></pre></div>`,5),o=[p];function t(c,r,D,y,C,F){return n(),a("div",null,o)}var h=s(l,[["render",t]]);export{A as __pageData,h as default};
