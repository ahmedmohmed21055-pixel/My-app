const api = {
  list: '/api/items',
  add: '/api/items',
  update: id => `/api/items/${id}`,
  ai: '/api/ai'
};

let activeList = 'myStock';
const lists = ['myStock','shortages','marketCompare','bestSellers'];

document.querySelectorAll('.menu-btn').forEach(b => {
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.menu-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    showList(b.dataset.target);
  });
});
document.querySelector('.menu-btn').classList.add('active');
document.getElementById('addBtn').addEventListener('click', ()=> openModal());
document.getElementById('cancelItem').addEventListener('click', ()=> closeModal());
document.getElementById('saveItem').addEventListener('click', saveItem);
document.getElementById('aiAsk').addEventListener('click', askAI);
document.getElementById('search').addEventListener('input', renderLists);

const modal = document.getElementById('modal');
const state = { editingId: null, items: [] };

async function loadItems(){
  const res = await fetch(api.list);
  const items = await res.json();
  state.items = items;
  renderLists();
}
function showList(id){
  activeList = id;
  document.querySelectorAll('.list').forEach(l => l.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  renderLists();
}
function renderLists(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  lists.forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = '';
    const filtered = state.items.filter(it => it.name.toLowerCase().includes(q));
    filtered.forEach(it => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <img src="${it.img||'https://via.placeholder.com/150'}" alt="">
        <div class="item-info">
          <div class="item-name">${it.name}</div>
          <div class="item-meta">
            <div>سعر البيع: <strong>${it.sellPrice.toFixed(2)}</strong> ج</div>
            <div style="display:none">سعر الشراء: <strong class="hidden">${it.purchasePrice.toFixed(2)}</strong></div>
            <div>الكمية: ${it.qty}</div>
          </div>
        </div>
        <div class="item-actions">
          <button onclick="editItem('${it.id}')">تعديل</button>
          <button onclick="deleteItem('${it.id}')">حذف</button>
        </div>
      `;
      el.appendChild(div);
    });
  });
}

function openModal(item){
  modal.classList.remove('hidden');
  document.getElementById('modalTitle').textContent = item ? 'تعديل صنف' : 'أضف صنف';
  document.getElementById('itemName').value = item ? item.name : '';
  document.getElementById('itemPurchase').value = item ? item.purchasePrice : '';
  document.getElementById('itemSell').value = item ? item.sellPrice : '';
  document.getElementById('itemQty').value = item ? item.qty : '';
  document.getElementById('itemImg').value = item ? item.img : '';
  state.editingId = item ? item.id : null;
}

function closeModal(){
  modal.classList.add('hidden');
  state.editingId = null;
}

async function saveItem(){
  const name = document.getElementById('itemName').value.trim();
  const purchasePrice = parseFloat(document.getElementById('itemPurchase').value || 0);
  const sellPrice = parseFloat(document.getElementById('itemSell').value || 0);
  const qty = parseInt(document.getElementById('itemQty').value || 0);
  const img = document.getElementById('itemImg').value.trim();
  if (!name) return alert('اكتب اسم الصنف');
  if (state.editingId){
    const res = await fetch(api.update(state.editingId), { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, purchasePrice, sellPrice, qty, img }) });
    const updated = await res.json();
  } else {
    const res = await fetch(api.add, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, purchasePrice, sellPrice, qty, img }) });
    const added = await res.json();
  }
  await loadItems();
  closeModal();
}

async function editItem(id){
  const it = state.items.find(i=>i.id===id);
  openModal(it);
}

async function deleteItem(id){
  if (!confirm('متأكد تحذف الصنف؟')) return;
  await fetch(api.update(id), { method:'DELETE' }).catch(()=>{});
  await fetch(`/api/items/${id}`, { method:'DELETE' });
  await loadItems();
}

async function askAI(){
  const q = prompt('اسأل الـ AI (مثال: سعر سلك نحاس تركي كام؟ او اقترح سعر بيع لـ بطارية AAA نسبة 20%)');
  if (!q) return;
  const res = await fetch(api.ai, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt: q }) });
  const j = await res.json();
  alert(j.text);
}

// microphone (Web Speech API) - works on Safari (webkitSpeechRecognition) & Chrome
const micBtn = document.getElementById('micBtn');
let recognizing = false;
let recognition = null;
function setupSpeech(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('micStatus').textContent = 'Speech not supported';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'ar-EG';
  recognition.interimResults = false;
  recognition.onstart = ()=>{ recognizing = true; document.getElementById('micStatus').textContent = 'اسمعك...'; }
  recognition.onend = ()=>{ recognizing = false; document.getElementById('micStatus').textContent = 'اضغط للتكلم'; }
  recognition.onresult = (e)=>{
    const text = e.results[0][0].transcript;
    document.getElementById('micStatus').textContent = text;
    // simple parser: "اضف X سعر شراء 10 سعر بيع 15 كمية 20"
    if (/اضف|أضف/i.test(text)){
      // try extract numbers
      const name = text.replace(/اضف|أضف|سعر|شراء|بيع|كمية|كميه/ig, '').trim();
      // fallback: ask via prompt for details
      const pname = prompt('اسم الصنف (مستخرج من كلامك):', name || '');
      const pPurchase = parseFloat(prompt('سعر الشراء؟','0') || '0');
      const pSell = parseFloat(prompt('سعر البيع؟','0') || '0');
      const pQty = parseInt(prompt('الكمية؟','0') || '0');
      fetch(api.add, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:pname, purchasePrice:pPurchase, sellPrice:pSell, qty:pQty, img:'' }) }).then(()=>loadItems());
    } else {
      // send to AI for answer
      fetch(api.ai, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt: text }) }).then(r=>r.json()).then(j=>alert(j.text));
    }
  };
}
micBtn.addEventListener('click', ()=>{
  if (!recognition) return;
  if (recognizing) recognition.stop(); else recognition.start();
});
setupSpeech();
loadItems();
