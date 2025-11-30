document.addEventListener('DOMContentLoaded', () => {
    const filtersContainer = document.getElementById('filters-container');
    const contentContainer = document.getElementById('content-area');
    let allNewsData = [];

    // 1. Cargar datos
    fetchData();

    function fetchData() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error('Error cargando data.json');
                return response.json();
            })
            .then(data => {
                allNewsData = data;
                initPage();
            })
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = '<p style="text-align:center">Error al cargar las noticias.</p>';
            });
    }

    // 2. Helper para el video
    function getMediaHtml(item) {
        if (item.video) {
            if (item.video.includes('.mp4')) {
                // Video Local (MP4) - IMPORTANTE: position:absolute para respetar el wrapper CSS
                return `
                    <div class="video-wrapper">
                        <video controls muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; background: black;">
                            <source src="${item.video}" type="video/mp4">
                            Tu navegador no soporta video.
                        </video>
                    </div>
                `;
            } else {
                // YouTube
                return `
                    <div class="video-wrapper">
                        <iframe src="${item.video}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
                    </div>
                `;
            }
        }
        return `<img src="${item.imagen || 'img/placeholder.jpg'}" alt="${item.titulo}" class="card-image">`;
    }

    // 3. Router
    function initPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');

        if (newsId) {
            if (filtersContainer) filtersContainer.style.display = 'none';
            renderDetail(parseInt(newsId));
        } else {
            if (filtersContainer) {
                filtersContainer.style.display = 'flex';
                renderFilters();
            }
            renderHome(allNewsData);
        }
    }

    // 4. Filtros
    function renderFilters() {
        const fixedCategories = ['Todas', 'Última Hora', 'Competición', 'Eventos', 'Instalaciones'];
        let html = '';
        fixedCategories.forEach(cat => {
            const isActive = cat === 'Todas' ? 'active' : '';
            html += `<button class="filter-btn ${isActive}" onclick="filterNews('${cat}')">${cat}</button>`;
        });
        filtersContainer.innerHTML = html;
    }

    window.filterNews = function (category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toUpperCase() === category.toUpperCase()) {
                btn.classList.add('active');
            }
        });

        if (category === 'Todas') {
            renderHome(allNewsData);
        } else {
            const filtered = allNewsData.filter(item =>
                item.categoria.toUpperCase() === category.toUpperCase()
            );
            renderHome(filtered);
        }
    };

    // 5. Render Home
    function renderHome(newsData) {
        contentContainer.innerHTML = '';

        if (newsData.length === 0) {
            contentContainer.innerHTML = '<div style="text-align:center; padding:40px;"><p>No hay noticias en esta categoría.</p></div>';
            return;
        }

        const isFiltered = newsData.length !== allNewsData.length;
        let html = '';

        if (!isFiltered && newsData.length >= 3) {
            const featuredNews = newsData.slice(0, 3);
            const standardNews = newsData.slice(3);

            html += `
                <section class="featured-section">
                    <h2 class="section-title">Destacado en Puente Europa</h2>
                    <div class="featured-grid">
            `;

            featuredNews.forEach((item, index) => {
                const cssClass = index === 0 ? 'main' : 'secondary';
                html += `
                    <article class="news-card featured-item ${cssClass}" onclick="openNews(${item.id})">
                        ${getMediaHtml(item)}
                        <div class="card-overlay">
                            <span class="category-tag">${item.categoria}</span>
                            <h2>${item.titulo}</h2>
                            ${index === 0 ? `<p>${item.resumen}</p>` : ''}
                        </div>
                    </article>
                `;
            });

            html += `</div></section>`;
            
            if(standardNews.length > 0) {
                html += renderStandardGrid(standardNews, "Otras Noticias");
            }
        } else {
            const title = isFiltered ? `Categoría: ${newsData[0].categoria}` : "Últimas Noticias";
            html += renderStandardGrid(newsData, title);
        }
        contentContainer.innerHTML = html;
    }

    function renderStandardGrid(newsList, title) {
        let html = `<section class="standard-section"><h2 class="section-title">${title}</h2><div class="standard-grid">`;
        newsList.forEach(item => {
            html += `
                <article class="standard-card" onclick="openNews(${item.id})">
                    ${getMediaHtml(item)}
                    <div class="standard-content">
                        <span class="category-tag" style="align-self:start">${item.categoria}</span>
                        <h3>${item.titulo}</h3>
                        <p>${item.resumen.substring(0, 100)}...</p>
                        <span class="read-more">Leer noticia completa</span>
                    </div>
                </article>
            `;
        });
        html += `</div></section>`;
        return html;
    }

    // 6. Render Detail
    function renderDetail(id) {
        const newsItem = allNewsData.find(item => item.id === id);

        if (!newsItem) {
            contentContainer.innerHTML = '<h2>Noticia no encontrada</h2><a href="index.html" class="btn-back">Volver</a>';
            return;
        }

        // En detalle usamos la misma función getMediaHtml para mostrar SOLO el video si existe
        const mediaHtml = getMediaHtml(newsItem);

        const html = `
            <div class="detail-view">
                <a href="index.html" class="btn-back">← Volver al Feed</a>
                
                <header class="detail-header">
                    <span class="category-tag">${newsItem.categoria}</span>
                    <h1>${newsItem.titulo}</h1>
                    <div class="detail-meta">Publicado el ${newsItem.fecha}</div>
                </header>

                <div class="detail-media">
                    ${mediaHtml}
                </div>

                <div class="detail-text">
                    <p><strong>${newsItem.resumen}</strong></p>
                    <br>
                    <p>${newsItem.contenido}</p>
                </div>
            </div>
        `;

        contentContainer.innerHTML = html;
        window.scrollTo(0, 0);
    }

    window.openNews = function(id) {
        if (event.target.tagName === 'VIDEO' || event.target.tagName === 'IFRAME') return;
        window.location.href = `?id=${id}`;
    };
});