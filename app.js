const KEY="blnco-free-projects-v1";
let projects=loadProjects(), activeId=null;
const $=id=>document.getElementById(id);
function loadProjects(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(projects));$("savedStatus").textContent="Saved on this device";render()}
function uid(){return "p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function createProject(category="General"){const p={id:uid(),title:`New ${category} project`,category,body:"",updated:Date.now()};projects.unshift(p);activeId=p.id;save();openEditor(p.id)}
function render(){ $("projectCount").textContent=projects.length; renderList($("recentProjects"),projects.slice(0,3));renderList($("allProjects"),projects)}
function renderList(el,items){if(!items.length){el.innerHTML='<div class="empty">No projects yet. Create one to get started.</div>';return}el.innerHTML=items.map(p=>`<div class="project-row"><div><strong>${escapeHtml(p.title||"Untitled")}</strong><small>${escapeHtml(p.category||"General")} · Updated ${new Date(p.updated).toLocaleDateString()}</small></div><button data-open="${p.id}">Open →</button></div>`).join("");el.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openEditor(b.dataset.open))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function show(view){["home","projects","assistant","editor"].forEach(v=>$ (v+"View").classList.toggle("hidden",v!==view));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===view));window.scrollTo({top:0,behavior:"smooth"})}
function openEditor(id){const p=projects.find(x=>x.id===id);if(!p)return;activeId=id;$("projectTitle").value=p.title;$("projectCategory").value=p.category;$("projectBody").value=p.body;$("editorHeading").textContent=p.title||"Project";show("editor")}
function updateActive(){const p=projects.find(x=>x.id===activeId);if(!p)return;p.title=$("projectTitle").value;p.category=$("projectCategory").value;p.body=$("projectBody").value;p.updated=Date.now();$("editorHeading").textContent=p.title||"Project";localStorage.setItem(KEY,JSON.stringify(projects));$("savedStatus").textContent="Saved on this device";render()}
function download(name,content,type="text/plain"){const blob=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function makePrompt(){const kind=$("taskType").value,task=$("taskPrompt").value.trim();return `You are BLNCO AI, a practical creator and business assistant. Help me with ${kind.toLowerCase()}. Keep advice realistic, low-cost, organized, and actionable. I am building a personal brand around music, gaming/streaming, content creation, and entrepreneurship while balancing a 9–5 job. Do not assume I have a budget. Give me clear next steps.\n\nMy request:\n${task||"Help me decide the best next step and ask one question if needed."}`}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>show(t.dataset.view));
document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>show(b.dataset.goto));
$("newProject").onclick=()=>createProject();$("newProjectTop").onclick=()=>createProject();
document.querySelectorAll("[data-template]").forEach(b=>b.onclick=()=>createProject(b.dataset.template));
$("backProjects").onclick=()=>show("projects");
["projectTitle","projectCategory","projectBody"].forEach(id=>$(id).addEventListener("input",updateActive));
$("exportProject").onclick=()=>{const p=projects.find(x=>x.id===activeId);if(p)download((p.title||"blnco-project").replace(/[^a-z0-9-_]/gi,"-")+".txt",`BLNCO AI PROJECT\n${p.title}\nCategory: ${p.category}\n\n${p.body}`)};
$("duplicateProject").onclick=()=>{const p=projects.find(x=>x.id===activeId);if(p){const c={...p,id:uid(),title:p.title+" copy",updated:Date.now()};projects.unshift(c);save();openEditor(c.id)}};
$("deleteProject").onclick=()=>{if(!confirm("Delete this project from this device?"))return;projects=projects.filter(x=>x.id!==activeId);activeId=null;save();show("projects")};
$("copyPrompt").onclick=async()=>{try{await navigator.clipboard.writeText(makePrompt());$("copyStatus").textContent="Prompt copied. Open ChatGPT and paste it into a new chat."}catch{$("copyStatus").textContent="Copy isn't available here. Select and copy the prompt text manually."}};
function openChat(){window.open("https://chatgpt.com/","_blank","noopener")}
$("openChatgpt").onclick=openChat;$("chatgptTop").onclick=openChat;
$("voiceInput").onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("copyStatus").textContent="Voice typing isn't supported in this browser. Use the microphone on your iPhone keyboard.";return}const r=new SR();r.lang="en-CA";r.interimResults=false;r.onresult=e=>{$("taskPrompt").value+=($("taskPrompt").value?" ":"")+e.results[0][0].transcript};r.onerror=()=>{$("copyStatus").textContent="Voice input unavailable. Try your keyboard microphone."};r.start()};
$("stopVoice").onclick=()=>{if("speechSynthesis"in window)speechSynthesis.cancel()};
const allExport=document.createElement("button");allExport.className="outline-btn";allExport.textContent="Export all";allExport.onclick=()=>download("blnco-all-projects.json",JSON.stringify(projects,null,2),"application/json");$("projectsView").querySelector(".section-head").appendChild(allExport);
render();
