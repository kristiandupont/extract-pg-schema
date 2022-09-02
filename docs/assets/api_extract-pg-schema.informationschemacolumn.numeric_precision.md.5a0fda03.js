import{_ as e,c as n,o as a,a as i}from"./app.4cb370b5.js";const d=JSON.parse('{"title":"InformationSchemaColumn.numeric_precision property","description":"","frontmatter":{},"headers":[{"level":2,"title":"InformationSchemaColumn.numeric_precision property","slug":"informationschemacolumn-numeric-precision-property"}],"relativePath":"api/extract-pg-schema.informationschemacolumn.numeric_precision.md"}'),r={name:"api/extract-pg-schema.informationschemacolumn.numeric_precision.md"},c=i(`<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.informationschemacolumn.html">InformationSchemaColumn</a> &gt; <a href="./extract-pg-schema.informationschemacolumn.numeric_precision.html">numeric_precision</a></p><h2 id="informationschemacolumn-numeric-precision-property" tabindex="-1">InformationSchemaColumn.numeric_precision property <a class="header-anchor" href="#informationschemacolumn-numeric-precision-property" aria-hidden="true">#</a></h2><p>If data_type identifies a numeric type, this column contains the (declared or implicit) precision of the type for this column. The precision indicates the number of significant digits. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column numeric_precision_radix. For all other data types, this column is null.</p><p><b>Signature:</b></p><div class="language-typescript"><span class="copy"></span><pre><code><span class="line"><span style="color:#FFCB6B;">numeric_precision</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> number </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"></span></code></pre></div>`,5),o=[c];function t(s,p,m,l,h,u){return a(),n("div",null,o)}var f=e(r,[["render",t]]);export{d as __pageData,f as default};
