/**
 * Bonsai Marketplace - Core Logic
 * Features: Hub System, Chat, Negotiations, Search, filters
 */

// --- Estado Global ---
const user = { id: 1, name: 'Ricardo Silva', avatar: 'https://i.pravatar.cc/150?u=1' };
let anuncios = []; // Carregado dinamicamente
let conversas = [];
let negociacoes = [];
let avisos = [];

// Variável para controlar a lista filtrada atual (para navegação do modal)
let filteredAds = [];
let currentModalIndex = -1;

// --- Mock Data Loader ---
function initData() {
    // Anúncios
    anuncios = [
        { id: 1, title: 'Câmera DSLR Profissional', price: 3500, cat: 'eletronicos', type: 'venda', promoted: true, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500', loc: 'São Paulo, SP' },
        { id: 2, title: 'Serviço de Jardinagem', price: 150, cat: 'servicos', type: 'servicos', promoted: false, img: 'https://images.unsplash.com/photo-1416879115039-36bd07d68704?w=500', loc: 'Rio de Janeiro, RJ' },
        { id: 3, title: 'Leilão: Relógio Antigo', price: 1200, cat: 'leiloes', type: 'leiloes', promoted: true, img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500', loc: 'Curitiba, PR' },
        { id: 4, title: 'MacBook Pro M1', price: 8000, cat: 'eletronicos', type: 'venda', promoted: false, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500', loc: 'Belo Horizonte, MG' },
        { id: 5, title: 'Consultoria Financeira', price: 300, cat: 'servicos', type: 'servicos', promoted: true, img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500', loc: 'Online' },
        { id: 6, title: 'Drone 4K DJI', price: 4500, cat: 'eletronicos', type: 'venda', promoted: false, img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500', loc: 'Salvador, BA' },
        { id: 7, title: 'Guitarra Fender Stratocaster', price: 5500, cat: 'instrumentos', type: 'venda', promoted: false, img: 'https://images.unsplash.com/photo-1550985616-10c1deeaf759?w=500', loc: 'Porto Alegre, RS' },
        { id: 8, title: 'Sofá Retrátil 3 Lugares', price: 1800, cat: 'casa', type: 'venda', promoted: false, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', loc: 'São Paulo, SP' },
        { id: 9, title: 'Camisa de Time Rara', price: 400, cat: 'esportes', type: 'venda', promoted: true, img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=500', loc: 'Rio de Janeiro, RJ' },
        { id: 10, title: 'Desenvolvimento Web', price: 2000, cat: 'tecnologia', type: 'servicos', promoted: false, img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500', loc: 'Online' }
    ];

    // Conversas
    conversas = [
        {
            id: 101,
            withUser: 'Ana Souza',
            avatar: 'https://i.pravatar.cc/150?u=2',
            subject: 'Câmera DSLR',
            lastMsg: 'Aceita 3200 à vista?',
            unread: 2,
            msgs: [
                { from: 'them', text: 'Olá, ainda está disponível?' },
                { from: 'you', text: 'Sim, Ana! Tudo bem?' },
                { from: 'them', text: 'Aceita 3200 à vista?' }
            ]
        },
        {
            id: 102,
            withUser: 'Carlos Tech',
            avatar: 'https://i.pravatar.cc/150?u=3',
            subject: 'MacBook Pro',
            lastMsg: 'Combinado!',
            unread: 0,
            msgs: [
                { from: 'you', text: 'Podemos fechar em 7800?' },
                { from: 'them', text: 'Combinado!' }
            ]
        }
    ];

    // Negociações
    negociacoes = [
        { id: 201, title: 'Câmera DSLR', status: 'Proposta', progress: 50, price: 3200, img: anuncios[0].img },
        { id: 202, title: 'Drone 4K', status: 'Interesse', progress: 20, price: 4500, img: anuncios[5].img }
    ];

    // Avisos
    avisos = [
        { id: 301, title: 'Preço baixou!', desc: 'O iPhone que você favoritou baixou 5%', type: 'price', time: '2h atrás' },
        { id: 302, title: 'Bem-vindo', desc: 'Complete seu perfil para vender mais.', type: 'info', time: '1d atrás' }
    ];
}

// --- Lógica do Grid e Filtros ---
const DOM = {
    grid: document.getElementById('listaAnuncios'),
    noResult: document.getElementById('noResults'),
    cats: document.getElementById('listaCategoriasHorizontal'),
    subCatsContainer: document.getElementById('subCategoriesContainer'),
    subCatsList: document.getElementById('listaSubCategorias'),
    input: document.getElementById('inputBusca'),
    stats: document.getElementById('statsBar'),
    sectionTitle: document.getElementById('sectionTitle')
};

let filterState = { type: 'todos', cat: null, subCat: null, search: '', promoted: true };

// Nova Estrutura de Dados Hierárquica
const categoriasData = [
    {
        id: 'eletronicos', icon: 'devices', label: 'Eletrônicos',
        subs: [
            { id: 'celulares', label: 'Smartphones' },
            { id: 'computadores', label: 'Computadores & Notebooks' },
            { id: 'games', label: 'Games & Consoles' },
            { id: 'audio', label: 'Áudio & Fones' },
            { id: 'cameras', label: 'Câmeras' },
            { id: 'tv', label: 'TV & Vídeo' }
        ]
    },
    {
        id: 'casa', icon: 'chair', label: 'Casa & Jardim',
        subs: [
            { id: 'moveis', label: 'Móveis' },
            { id: 'decoracao', label: 'Decoração' },
            { id: 'jardinagem', label: 'Jardinagem & Plantas' },
            { id: 'ferramentas', label: 'Ferramentas' },
            { id: 'iluminacao', label: 'Iluminação' },
            { id: 'cozinha', label: 'Cozinha' }
        ]
    },
    {
        id: 'moda', icon: 'checkroom', label: 'Moda',
        subs: [
            { id: 'roupas_fem', label: 'Roupas Femininas' },
            { id: 'roupas_masc', label: 'Roupas Masculinas' },
            { id: 'calcados', label: 'Calçados' },
            { id: 'acessorios', label: 'Bolsas & Acessórios' },
            { id: 'joias', label: 'Joias & Relógios' }
        ]
    },
    {
        id: 'veiculos', icon: 'directions_car', label: 'Veículos',
        subs: [
            { id: 'carros', label: 'Carros' },
            { id: 'motos', label: 'Motos' },
            { id: 'pecas', label: 'Peças & Acessórios' },
            { id: 'caminhoes', label: 'Caminhões' }
        ]
    },
    {
        id: 'servicos', icon: 'handyman', label: 'Serviços',
        subs: [
            { id: 'reformas', label: 'Reformas & Reparos' },
            { id: 'aulas', label: 'Aulas' },
            { id: 'tecnologia_serv', label: 'Tecnologia' },
            { id: 'saude', label: 'Saúde & Beleza' },
            { id: 'fretes', label: 'Fretes & Mudanças' }
        ]
    },
    {
        id: 'esportes', icon: 'sports_soccer', label: 'Esportes',
        subs: [
            { id: 'fitness', label: 'Fitness & Musculação' },
            { id: 'ciclismo', label: 'Ciclismo' },
            { id: 'camping', label: 'Camping & Pesca' },
            { id: 'futebol', label: 'Futebol' }
        ]
    },
    {
        id: 'lazer', icon: 'rocket_launch', label: 'Lazer & Hobbies',
        subs: [
            { id: 'instrumentos', label: 'Instrumentos Musicais' },
            { id: 'colecionaveis', label: 'Colecionáveis' },
            { id: 'livros', label: 'Livros & Revistas' },
            { id: 'brinquedos', label: 'Brinquedos' }
        ]
    }
];

// Precisamos atualizar os dados de exemplo para usar os novos IDs de subcategoria (subCat)
// Atualize a função initData() no seu código com estes exemplos que possuem 'subCat':
/*
    Exemplo de estrutura do objeto anúncio agora:
    { 
      id: 1, 
      title: '...', 
      cat: 'eletronicos',    // Categoria Pai
      subCat: 'cameras',     // Categoria Filho (novo)
      type: 'venda', ... 
    }
*/
// Vou injetar subcategorias nos dados mockados existentes dinamicamente para teste:
function enrichMockData() {
    anuncios.forEach(ad => {
        // Lógica simples para atribuir subcategorias baseada no título para teste
        if (ad.cat === 'eletronicos') {
            if (ad.title.includes('Câmera')) ad.subCat = 'cameras';
            else if (ad.title.includes('MacBook')) ad.subCat = 'computadores';
            else if (ad.title.includes('Drone')) ad.subCat = 'cameras';
            else ad.subCat = 'celulares';
        }
        if (ad.cat === 'servicos') {
            if (ad.title.includes('Jardinagem')) { ad.cat = 'casa'; ad.subCat = 'jardinagem'; } // Mudando categoria para testar
            else if (ad.title.includes('Financeira')) ad.subCat = 'consultoria';
            else if (ad.title.includes('Web')) ad.subCat = 'tecnologia_serv';
        }
        // ... outros mapeamentos se necessário
    });
}

function renderGrid() {
    DOM.grid.innerHTML = '';

    filteredAds = anuncios.filter(ad => {
        if (filterState.type !== 'todos' && ad.type !== filterState.type) return false;

        // Filtro Pai
        if (filterState.cat && ad.cat !== filterState.cat) return false;

        // Filtro Filho (Subcategoria)
        if (filterState.subCat && ad.subCat !== filterState.subCat) return false;

        if (filterState.search && !ad.title.toLowerCase().includes(filterState.search)) return false;
        if (!filterState.promoted && ad.promoted) return false;
        return true;
    });

    if (filterState.promoted) {
        filteredAds.sort((a, b) => Number(b.promoted) - Number(a.promoted));
    }

    updateSectionTitle();

    if (filteredAds.length === 0) {
        DOM.noResult.classList.remove('d-none');
        DOM.stats.innerText = '';
    } else {
        DOM.noResult.classList.add('d-none');
        DOM.stats.innerText = `${filteredAds.length} resultados encontrados`;

        filteredAds.forEach(ad => {
            const div = document.createElement('div');
            div.className = `bonsai-card ${ad.promoted ? 'promoted' : ''}`;
            div.onclick = () => abrirDetalhes(ad.id);
            div.innerHTML = `
                ${ad.promoted ? '<div class="promo-badge">Destaque</div>' : ''}
                <div class="card-img-wrap">
                    <img src="${ad.img}" alt="${ad.title}">
                </div>
                <div class="card-body">
                    <div class="card-title">${ad.title}</div>
                    <div class="card-price">R$ ${ad.price.toLocaleString()}</div>
                    <div class="small text-muted mt-auto pt-2 d-flex align-items-center gap-1">
                        <span class="material-symbols-rounded" style="font-size:14px">location_on</span> ${ad.loc}
                    </div>
                </div>
            `;
            DOM.grid.appendChild(div);
        });
    }
}

function updateSectionTitle() {
    if (filterState.subCat) {
        // Tenta achar o nome da subcategoria
        const parent = categoriasData.find(c => c.id === filterState.cat);
        const child = parent ? parent.subs.find(s => s.id === filterState.subCat) : null;
        DOM.sectionTitle.innerText = child ? child.label : 'Resultados';
    } else if (filterState.cat) {
        const catObj = categoriasData.find(c => c.id === filterState.cat);
        DOM.sectionTitle.innerText = catObj ? catObj.label : 'Resultados';
    } else if (filterState.type !== 'todos') {
        DOM.sectionTitle.innerText = filterState.type.charAt(0).toUpperCase() + filterState.type.slice(1);
    } else if (filterState.search) {
        DOM.sectionTitle.innerText = `Busca: "${filterState.search}"`;
    } else {
        DOM.sectionTitle.innerText = 'Explorar';
    }
}

function renderCategories() {
    DOM.cats.innerHTML = categoriasData.map(c => {
        const isActive = filterState.cat === c.id ? 'active' : '';
        return `
        <div class="cat-chip ${isActive}" onclick="filtrarCategoria('${c.id}')">
            <span class="material-symbols-rounded">${c.icon}</span> ${c.label}
        </div>
    `}).join('');
}

function renderSubCategories(parentId) {
    const parent = categoriasData.find(c => c.id === parentId);

    if (!parent || !parent.subs || parent.subs.length === 0) {
        DOM.subCatsContainer.classList.add('d-none');
        return;
    }

    DOM.subCatsList.innerHTML = parent.subs.map(sub => {
        const isActive = filterState.subCat === sub.id ? 'active' : '';
        return `
            <div class="sub-chip ${isActive}" onclick="filtrarSubCategoria('${sub.id}')">
                ${sub.label}
            </div>
        `;
    }).join('');

    DOM.subCatsContainer.classList.remove('d-none');
}

function filtrarCategoria(id) {
    if (filterState.cat === id) {
        // Se clicar no mesmo, desativa tudo
        filterState.cat = null;
        filterState.subCat = null;
        DOM.subCatsContainer.classList.add('d-none');
    } else {
        // Novo Pai selecionado
        filterState.cat = id;
        filterState.subCat = null; // Reseta subcategoria ao mudar de pai
        renderSubCategories(id);
    }
    renderCategories();
    renderGrid();
}

function filtrarSubCategoria(subId) {
    if (filterState.subCat === subId) {
        filterState.subCat = null; // Desativa sub (volta a ver o Pai inteiro)
    } else {
        filterState.subCat = subId;
    }
    renderSubCategories(filterState.cat); // Re-renderiza para atualizar visual 'active'
    renderGrid();
}

// Event Listeners da Home
document.getElementById('grupoTipos').addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        document.querySelectorAll('#grupoTipos .nav-link').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filterState.type = e.target.dataset.id;

        if (filterState.type === 'todos') {
            filterState.cat = null;
            filterState.subCat = null;
            DOM.subCatsContainer.classList.add('d-none');
            renderCategories();
        }
        renderGrid();
    }
});

document.getElementById('switchPromovidos').addEventListener('change', (e) => {
    filterState.promoted = e.target.checked;
    renderGrid();
});

DOM.input.addEventListener('input', (e) => {
    filterState.search = e.target.value.toLowerCase();
    renderGrid();
});

function limparFiltros() {
    filterState = { type: 'todos', cat: null, subCat: null, search: '', promoted: true };
    DOM.input.value = '';
    DOM.subCatsContainer.classList.add('d-none');

    document.querySelectorAll('#grupoTipos .nav-link').forEach(b => b.classList.remove('active'));
    document.querySelector('#grupoTipos .nav-link[data-id="todos"]').classList.add('active');

    renderCategories();
    renderGrid();
}

// Chame enrichMockData() logo após initData() no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initData();
    enrichMockData(); // <--- IMPORTANTE: Adicione isso para os dados de teste funcionarem
    renderCategories();
    renderGrid();

    // ... resto do código ...
});


// --- Lógica do HUB ---
const Hub = {
    el: document.getElementById('bonsaiHub'),
    activeView: null,

    open(viewName = 'chat') {
        this.el.classList.remove('d-none');
        this.switchView(viewName);
        document.getElementById('hubAvatar').src = user.avatar;
    },

    close() {
        this.el.classList.add('d-none');
    },

    switchView(viewName) {
        document.querySelectorAll('.dock-item').forEach(i => i.classList.remove('active'));
        const btn = document.querySelector(`.dock-item[data-view="${viewName}"]`);
        if (btn) btn.classList.add('active');

        document.querySelectorAll('.hub-view').forEach(v => v.classList.add('d-none'));
        document.getElementById(`view-${viewName}`).classList.remove('d-none');
        this.activeView = viewName;

        if (viewName === 'chat') renderChatList();
        if (viewName === 'negociacoes') renderNegociacoes();
        if (viewName === 'avisos') renderAvisos();
        if (viewName === 'perfil') renderPerfil();
    },

    mobileBackToChatList() {
        document.querySelector('.chat-stage').classList.remove('active');
    },

    markAllRead() {
        alert('Todos os avisos marcados como lidos!');
    }
};

// --- CHAT SYSTEM, NEGOCIAÇÕES, AVISOS, PERFIL (Mantidos igual, código omitido para brevidade, a lógica é a mesma) ---
// Reutilize o código original para estas seções, pois não houveram mudanças solicitadas na lógica interna do Hub, apenas CSS.
function renderChatList() {
    const container = document.getElementById('chatListContainer');
    container.innerHTML = conversas.map(c => `
        <div class="chat-item" onclick="openConversation(${c.id})">
            <img src="${c.avatar}" class="chat-item-avatar">
            <div class="flex-grow-1 overflow-hidden">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold text-truncate">${c.withUser}</span>
                    ${c.unread ? '<span class="badge bg-primary rounded-pill">New</span>' : ''}
                </div>
                <div class="small text-muted text-truncate">${c.subject}</div>
                <div class="small text-muted text-truncate opacity-75">${c.lastMsg}</div>
            </div>
        </div>
    `).join('');
}

function openConversation(id) {
    const chat = conversas.find(c => c.id === id);
    if (!chat) return;
    document.querySelector('.chat-stage').classList.add('active');
    document.getElementById('chatEmptyState').classList.add('d-none');
    document.getElementById('chatActive').classList.remove('d-none');
    document.getElementById('chatActive').classList.add('d-flex');
    document.getElementById('chatHeaderImg').src = chat.avatar;
    document.getElementById('chatHeaderName').innerText = chat.withUser;
    document.getElementById('chatHeaderSubject').innerText = chat.subject;
    const body = document.getElementById('chatMessages');
    body.innerHTML = chat.msgs.map(m => `
        <div class="d-flex w-100">
            <div class="chat-msg-bubble ${m.from}">
                ${m.text}
            </div>
        </div>
    `).join('');
    body.scrollTop = body.scrollHeight;
}

function renderNegociacoes() {
    const grid = document.getElementById('negociacoesGrid');
    grid.innerHTML = negociacoes.map(n => {
        let barColor = 'bg-primary';
        if (n.progress > 80) barColor = 'bg-success';
        return `
        <div class="col-md-6 col-lg-4">
            <div class="deal-card">
                <div class="d-flex gap-3">
                    <img src="${n.img}" class="rounded" width="60" height="60" style="object-fit:cover">
                    <div>
                        <div class="fw-bold">${n.title}</div>
                        <div class="text-primary fw-bold">R$ ${n.price}</div>
                    </div>
                </div>
                <div>
                    <div class="d-flex justify-content-between small fw-bold text-muted mb-1">
                        <span>Status: ${n.status}</span>
                        <span>${n.progress}%</span>
                    </div>
                    <div class="deal-progress">
                        <div class="deal-bar ${barColor}" style="width: ${n.progress}%"></div>
                    </div>
                    <div class="deal-step">
                        <span>Início</span>
                        <span>Acordo</span>
                        <span>Pagto</span>
                    </div>
                </div>
                <button class="btn btn-outline-primary btn-sm w-100" onclick="Hub.open('chat')">Ver Conversa</button>
            </div>
        </div>
    `}).join('');
}

function renderAvisos() {
    const list = document.getElementById('avisosList');
    list.innerHTML = avisos.map(a => {
        let icon = 'info', color = 'bg-light text-dark';
        if (a.type === 'price') { icon = 'trending_down'; color = 'bg-success-subtle text-success'; }
        return `
        <div class="aviso-card">
            <div class="aviso-icon-box ${color}">
                <span class="material-symbols-rounded">${icon}</span>
            </div>
            <div>
                <div class="fw-bold">${a.title} <span class="text-muted fw-normal small ms-2">${a.time}</span></div>
                <div class="text-muted small">${a.desc}</div>
            </div>
        </div>
    `}).join('');
}

function renderPerfil() {
    document.getElementById('profileViewImg').src = user.avatar;
    document.getElementById('profileViewName').innerText = user.name;
}

// --- MODAL DETALHES & NAVEGAÇÃO ---

function abrirDetalhes(id) {
    // Encontra o índice do item clicado DENTRO da lista filtrada atual
    const index = filteredAds.findIndex(a => a.id === id);
    if (index === -1) return;

    loadModalData(index);

    const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    modal.show();
}

function loadModalData(index) {
    currentModalIndex = index;
    const ad = filteredAds[index];

    document.getElementById('modalTitle').innerText = ad.title;
    document.getElementById('modalPrice').innerText = `R$ ${ad.price.toLocaleString()}`;
    document.getElementById('modalLocation').innerText = ad.loc;
    document.getElementById('modalDate').innerText = 'Publicado hoje';
    document.getElementById('modalDesc').innerText = 'Descrição detalhada do produto com todas as especificações técnicas e estado de conservação. Ótima oportunidade.';
    document.getElementById('modalCatBadge').innerText = ad.cat.toUpperCase();

    const slides = document.getElementById('detalhesSlides');
    slides.innerHTML = `
        <div class="carousel-item active h-100">
            <img src="${ad.img}" class="d-block w-100 h-100" style="object-fit:contain">
        </div>
        <div class="carousel-item h-100">
            <div class="d-flex align-items-center justify-content-center h-100 bg-dark text-white">
                <div>
                    <span class="material-symbols-rounded display-1">play_circle</span>
                    <p>Vídeo Demonstrativo</p>
                </div>
            </div>
        </div>
    `;
}

// Ajuste 7: Função para navegar (próximo/anterior) sem fechar o modal
function navigateModal(direction) {
    let newIndex = currentModalIndex + direction;

    // Loop infinito (se chegar no fim, volta pro começo)
    if (newIndex >= filteredAds.length) newIndex = 0;
    if (newIndex < 0) newIndex = filteredAds.length - 1;

    loadModalData(newIndex);
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
    renderCategories();
    renderGrid();

    document.getElementById('headerAvatar').src = user.avatar;

    if (conversas.some(c => c.unread > 0)) document.getElementById('badgeChat').classList.remove('d-none');
    if (avisos.length > 0) document.getElementById('badgeAvisos').classList.remove('d-none');
});