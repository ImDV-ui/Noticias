document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');

    // Función principal para cargar datos
    fetchData();

    function fetchData() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar el archivo JSON');
                return response.json();
            })
            .then(data => {
                handleRouting(data);
            })
            .catch(error => {
                console.error('Error:', error);
                appContainer.innerHTML = '<p>Error cargando las noticias. Asegúrate de abrir esto a través de un servidor local (o extensión Live Server) por seguridad del navegador.</p>';
            });
    }

    // Sistema de enrutamiento simple basado en URL Parameters
    function handleRouting(newsData) {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');

        if (newsId) {
            // Si hay ID, renderizamos el detalle
            renderDetail(newsData, newsId);
        } else {
            // Si no hay ID, renderizamos la Home
            renderHome(newsData);
        }
    }

    // Renderizar Home (Feed)
    function renderHome(newsData) {
        // Separamos las 3 primeras como destacadas y el resto como normales
        const featuredNews = newsData.slice(0, 3);
        const standardNews = newsData.slice(3);

        let html = `
            <section class="featured-section">
                <h2 class="section-title">Destacado en Puente Europa</h2>
                <div class="featured-grid">
        `;

        // Renderizar las 3 destacadas con lógica de grid (la primera es clase "main", las otras "secondary")
        featuredNews.forEach((item, index) => {
            const cssClass = index === 0 ? 'main' : 'secondary';
            html += `
                <article class="news-card featured-item ${cssClass}" onclick="openNews(${item.id})">
                    <img src="${item.imagen}" alt="${item.titulo}" class="card-image">
                    <div class="card-overlay">
                        <span class="category-tag">${item.categoria}</span>
                        <h2>${item.titulo}</h2>
                        ${index === 0 ? `<p>${item.resumen}</p>` : ''} <!-- Solo mostrar resumen en la grande -->
                    </div>
                </article>
            `;
        });

        html += `
                </div>
            </section>
            
            <section class="standard-section">
                <h2 class="section-title">Últimas Noticias</h2>
                <div class="standard-grid">
        `;

        // Renderizar el resto de noticias
        standardNews.forEach(item => {
            html += `
                <article class="standard-card" onclick="openNews(${item.id})">
                    <img src="${item.imagen}" alt="${item.titulo}">
                    <div class="standard-content">
                        <span class="category-tag" style="align-self:start">${item.categoria}</span>
                        <h3>${item.titulo}</h3>
                        <p>${item.resumen.substring(0, 100)}...</p>
                        <span class="read-more">Leer noticia completa →</span>
                    </div>
                </article>
            `;
        });

        html += `
                </div>
            </section>
        `;

        appContainer.innerHTML = html;
    }

    // Renderizar Detalle de Noticia
    function renderDetail(newsData, id) {
        const newsItem = newsData.find(item => item.id == id);

        if (!newsItem) {
            appContainer.innerHTML = '<h2>Noticia no encontrada</h2><a href="index.html" class="btn-back">Volver</a>';
            return;
        }

        // Verificar si hay video para renderizar el iframe
        let mediaHtml = `<img src="${newsItem.imagen}" alt="${newsItem.titulo}" class="detail-img">`;
        
        if (newsItem.video) {
            mediaHtml += `
                <div class="video-wrapper">
                    <iframe src="${newsItem.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        }

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
                    <br>
                    <p>Para más información sobre este tema, contacte con la secretaría del centro.</p>
                </div>
            </div>
        `;

        appContainer.innerHTML = html;
    }

    // Helper global para los onClicks
    window.openNews = function(id) {
        window.location.href = `?id=${id}`;
    };
});