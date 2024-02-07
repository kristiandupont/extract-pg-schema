import{_ as t,c as e,o as i,V as a}from"./chunks/framework.OAYYdmD4.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"api/extract-pg-schema.tablesecuritypolicy.md","filePath":"api/extract-pg-schema.tablesecuritypolicy.md"}'),r={name:"api/extract-pg-schema.tablesecuritypolicy.md"},s=a('<p><a href="./">Home</a> &gt; <a href="./extract-pg-schema.html">extract-pg-schema</a> &gt; <a href="./extract-pg-schema.tablesecuritypolicy.html">TableSecurityPolicy</a></p><h2 id="tablesecuritypolicy-interface" tabindex="-1">TableSecurityPolicy interface <a class="header-anchor" href="#tablesecuritypolicy-interface" aria-label="Permalink to &quot;TableSecurityPolicy interface&quot;">​</a></h2><p>Security policy on a table.</p><p><strong>Signature:</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TableSecurityPolicy</span></span></code></pre></div><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><table><thead><tr><th>Property</th><th>Modifiers</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.commandtype.html">commandType</a></td><td></td><td>&quot;ALL&quot; | &quot;SELECT&quot; | &quot;INSERT&quot; | &quot;UPDATE&quot; | &quot;DELETE&quot;</td><td>Command type the policy applies to. &quot;ALL&quot; if all commands.</td></tr><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.ispermissive.html">isPermissive</a></td><td></td><td>boolean</td><td>Whether the policy is permissive.</td></tr><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.modifiabilityexpression.html">modifiabilityExpression</a></td><td></td><td>string | null</td><td>Modifiability expression of the policy specified by the WITH CHECK clause.</td></tr><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.name.html">name</a></td><td></td><td>string</td><td>Name of the security policy.</td></tr><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.rolesappliedto.html">rolesAppliedTo</a></td><td></td><td>string[]</td><td>Array of roles the policy is applied to. [&quot;public&quot;] if applied to all roles.</td></tr><tr><td><a href="./extract-pg-schema.tablesecuritypolicy.visibilityexpression.html">visibilityExpression</a></td><td></td><td>string | null</td><td>Visibility expression of the policy specified by the USING clause.</td></tr></tbody></table>',7),o=[s];function c(l,p,d,h,n,y){return i(),e("div",null,o)}const b=t(r,[["render",c]]);export{m as __pageData,b as default};