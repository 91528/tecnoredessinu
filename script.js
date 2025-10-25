// Variables globales
let servicesData = [];
let productsData = [];
let currentFilter = 'all';

// Google Sheets Configuration
const SHEET_ID = '1NCenQV50oLRRE20cdXmqCHc5cUvxaBYqXGj49WKkvyI';
const SERVICES_RANGE = 'Servicios!A:F'; // Título, Subtítulo, Imagen, Descripción Modal, Color, Imagen Modal
const PRODUCTS_RANGE = 'Productos!A:E'; // Título, Descripción, Imagen, Precio, Estado (Nuevo/Usado)

// Función para cargar datos desde Google Sheets
async function loadGoogleSheetsData() {
    try {
        console.log('Iniciando carga de datos desde Google Sheets...');
        
        // Cargar servicios
        const servicesUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Servicios`;
        console.log('URL Servicios:', servicesUrl);
        const servicesResponse = await fetch(servicesUrl);
        const servicesText = await servicesResponse.text();
        console.log('Respuesta Servicios (primeros 200 chars):', servicesText.substring(0, 200));
        servicesData = parseCSV(servicesText);
        console.log('Servicios parseados:', servicesData);
        
        // Cargar productos
        const productsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Productos`;
        console.log('URL Productos:', productsUrl);
        const productsResponse = await fetch(productsUrl);
        const productsText = await productsResponse.text();
        console.log('Respuesta Productos (primeros 200 chars):', productsText.substring(0, 200));
        productsData = parseCSV(productsText);
        console.log('Productos parseados:', productsData);
        
        // Renderizar datos
        renderServices();
        renderProducts();
        
        console.log('Datos cargados desde Google Sheets:', { servicios: servicesData.length, productos: productsData.length });
    } catch (error) {
        console.error('Error cargando :', error);
        // Mostrar mensaje de error en la interfaz
        showErrorMessage('Error al cargar datos. Verifique la conexión a Google Sheets.');
    }
}

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    const servicesContainer = document.getElementById('servicios-container');
    const productsContainer = document.getElementById('productos-container');
    
    const errorHTML = `
        <div class="col-span-full text-center py-8">
            <div class="inline-flex items-center space-x-2 text-red-400">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                </svg>
                <span class="font-orbitron text-sm">${message}</span>
            </div>
        </div>
    `;
    
    if (servicesContainer) servicesContainer.innerHTML = errorHTML;
    if (productsContainer) productsContainer.innerHTML = errorHTML;
}

// Función para parsear CSV
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = (values[index] || '').replace(/"/g, '').trim();
            });
            // Solo agregar filas que tengan al menos un título
            if (row[headers[0]] && row[headers[0]].length > 0) {
                data.push(row);
            }
        }
    }
    return data;
}

// Función para parsear línea CSV con comillas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Comillas dobles escapadas
                current += '"';
                i++; // Saltar la siguiente comilla
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Función para renderizar servicios
function renderServices() {
    const servicesContainer = document.getElementById('servicios-container');
    
    if (servicesData.length === 0) {
        // Mostrar mensaje de carga o servicios por defecto
        servicesContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="inline-flex items-center space-x-2 text-tech-cyan">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                    </svg>
                    <span class="font-orbitron">No hay servicios disponibles en Google Sheets</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Limpiar contenedor
    servicesContainer.innerHTML = '';
    
    servicesData.forEach((service, index) => {
        const titulo = service['Título'] || service['Titulo'] || '';
        const subtitulo = service['Subtítulo'] || service['Subtitulo'] || '';
        const imagen = service['Imagen'] || service['imagen'] || '';
        const descripcionModal = service['Descripción Modal'] || service['Descripcion Modal'] || service['Descripción'] || service['Descripcion'] || subtitulo;
        const color = service['Color'] || service['color'] || 'tech-cyan';
        const imagenModal = service['Imagen Modal'] || service['imagen Modal'] || imagen;
        
        if (!titulo) return;
        
        const serviceCard = document.createElement('div');
        serviceCard.className = 'cursor-pointer group relative overflow-hidden rounded-2xl service-card';
        serviceCard.onclick = () => openGalleryModal(titulo, descripcionModal, imagenModal);
        
        serviceCard.innerHTML = `
            <div class="aspect-square overflow-hidden rounded-2xl">
                <img src="${imagen}" 
                     alt="${titulo}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                     onerror="this.src=''; this.alt='Imagen no disponible'; this.style.display='none';">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl"></div>
            <div class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
                <h4 class="font-bold text-${color} font-orbitron text-sm sm:text-base">${titulo}</h4>
            </div>
        `;
        
        servicesContainer.appendChild(serviceCard);
    });
    
    console.log(`Servicios renderizados: ${servicesData.length}`);
}

// Función para renderizar productos
function renderProducts() {
    const productsContainer = document.getElementById('productos-container');
    
    if (productsData.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="inline-flex items-center space-x-2 text-tech-cyan">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                    </svg>
                    <span class="font-orbitron">No hay productos disponibles en Google Sheets</span>
                </div>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = '';
    
    // Filtrar productos según el filtro actual
    const filteredProducts = productsData.filter(product => {
        if (currentFilter === 'all') return true;
        const estado = (product['Estado'] || product['estado'] || '').toLowerCase();
        return estado.includes(currentFilter);
    });
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="inline-flex items-center space-x-2 text-gray-400">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                    </svg>
                    <span class="font-orbitron">No hay productos ${currentFilter === 'nuevo' ? 'nuevos' : 'usados'} disponibles</span>
                </div>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach((product, index) => {
        const titulo = product['Título'] || product['Titulo'] || '';
        const descripcion = product['Descripción'] || product['Descripcion'] || '';
        const imagen = product['Imagen'] || product['imagen'] || '';
        const precio = product['Precio'] || product['precio'] || 'Precio no disponible';
        const estado = product['Estado'] || product['estado'] || '';
        
        if (!titulo) return;
        
        const colors = ['tech-cyan', 'green-400', 'red-400', 'purple-400', 'indigo-400', 'teal-400'];
        const color = colors[index % colors.length];
        
        // Determinar badge de estado
        const estadoLower = estado.toLowerCase();
        let estadoBadge = '';
        if (estadoLower.includes('nuevo')) {
            estadoBadge = '<span class="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-orbitron font-bold">NUEVO</span>';
        } else if (estadoLower.includes('usado')) {
            estadoBadge = '<span class="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-orbitron font-bold">USADO</span>';
        }
        
        const productCard = document.createElement('div');
        productCard.className = 'bg-gradient-to-br from-dark-card to-gray-900 rounded-2xl border border-tech-cyan/30 overflow-hidden product-card cursor-pointer relative';
        productCard.onclick = () => openProductModal(titulo, descripcion, precio, 'desktop', '', imagen);
        
        productCard.innerHTML = `
            <div class="overflow-hidden relative" style="aspect-ratio: 16/11.44;">
                <img src="${imagen}" 
                     alt="${titulo}" 
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                     onerror="this.src=''; this.alt='Imagen no disponible'; this.style.display='none';">
                ${estadoBadge}
            </div>
            <div class="p-4 sm:p-6 relative">
                <h4 class="text-lg sm:text-xl font-bold text-${color} mb-2 font-orbitron">${titulo}</h4>
                <p class="text-gray-300 text-xs sm:text-sm mb-4">${descripcion}</p>
                <div class="flex justify-between items-end">
                    <span class="text-xl sm:text-2xl font-bold text-${color} font-orbitron">${precio}</span>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    console.log(`Productos renderizados: ${filteredProducts.length} de ${productsData.length}`);
}

// Función para cambiar filtro
function setFilter(filter) {
    currentFilter = filter;
    
    // Actualizar botones
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.className = 'flex-1 sm:flex-none px-3 sm:px-6 md:px-8 py-2 rounded-full font-orbitron text-xs sm:text-sm font-medium transition-all duration-300 text-gray-300 hover:text-tech-cyan';
    });
    
    document.getElementById(`filter-${filter}`).className = 'flex-1 sm:flex-none px-3 sm:px-6 md:px-8 py-2 rounded-full font-orbitron text-xs sm:text-sm font-medium transition-all duration-300 bg-tech-cyan text-black';
    
    // Re-renderizar productos
    renderProducts();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de Google Sheets
    loadGoogleSheetsData();
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Mobile menu toggle
    document.getElementById('menu-toggle').addEventListener('click', function() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    });

    // Filter buttons
    document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-nuevo').addEventListener('click', () => setFilter('nuevo'));
    document.getElementById('filter-usado').addEventListener('click', () => setFilter('usado'));

    // Close modals on click outside
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeProductModal();
        }
    });

    document.getElementById('galleryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGalleryModal();
        }
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
});

// Product Modal Functions
function openProductModal(title, description, price, type, warranty = '', modalImage = '') {
    const modal = document.getElementById('productModal');
    const productTitle = document.getElementById('productTitle');
    const productDescription = document.getElementById('productDescription');
    const productPrice = document.getElementById('productPrice');
    const productIcon = document.getElementById('productIcon');
    const productModalImage = document.getElementById('productModalImage');
    
    productTitle.textContent = title;
    productDescription.textContent = description;
    productPrice.textContent = price;
    
    // Set modal image
    if (modalImage) {
        productModalImage.src = modalImage;
        productModalImage.alt = title;
        productModalImage.style.display = 'block';
        productModalImage.nextElementSibling.style.display = 'none';
    } else {
        productModalImage.style.display = 'none';
        productModalImage.nextElementSibling.style.display = 'flex';
    }
    
    // Set icon based on product type
    const icons = {
        desktop: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20,18C20.5,18 21,17.5 21,17V7C21,6.5 20.5,6 20,6H4C3.5,6 3,6.5 3,7V17C3,17.5 3.5,18 4,18H9V19H8V21H16V19H15V18H20M5,8H19V16H5V8Z"/></svg>',
        laptop: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20,18V4H4V18H20M20,2A2,2 0 0,1 22,4V18A2,2 0 0,1 20,20H4C2.89,20 2,19.1 2,18V4C2,2.89 2.89,2 4,2H20M5,5H19V16H5V5Z"/></svg>',
        gaming: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15Z"/></svg>',
        used: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4Z"/></svg>',
        business: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z"/></svg>',
        allinone: '<svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15Z"/></svg>'
    };
    
    productIcon.innerHTML = icons[type] || icons.desktop;
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

// Gallery Modal Functions
let currentServiceIndex = 0;

function openGalleryModal(title, subtitle, imageUrl) {
    const modal = document.getElementById('galleryModal');
    
    // Encontrar el índice del servicio actual
    currentServiceIndex = servicesData.findIndex(service => {
        const serviceTitulo = service['Título'] || service['Titulo'] || '';
        return serviceTitulo === title;
    });
    
    if (currentServiceIndex === -1) currentServiceIndex = 0;
    
    updateGalleryModal();
    modal.classList.add('active');
}

function updateGalleryModal() {
    if (servicesData.length === 0) return;
    
    const service = servicesData[currentServiceIndex];
    const titulo = service['Título'] || service['Titulo'] || '';
    const descripcionModal = service['Descripción Modal'] || service['Descripcion Modal'] || service['Descripción'] || service['Descripcion'] || service['Subtítulo'] || service['Subtitulo'] || '';
    const imagenModal = service['Imagen Modal'] || service['imagen Modal'] || service['Imagen'] || service['imagen'] || '';
    
    const galleryTitle = document.getElementById('galleryTitle');
    const gallerySubtitle = document.getElementById('gallerySubtitle');
    const galleryImage = document.getElementById('galleryImage');
    
    galleryTitle.textContent = titulo;
    gallerySubtitle.textContent = descripcionModal;
    
    if (imagenModal) {
        galleryImage.src = imagenModal;
        galleryImage.alt = titulo;
        galleryImage.style.display = 'block';
        galleryImage.nextElementSibling.style.display = 'none';
    } else {
        galleryImage.style.display = 'none';
        galleryImage.nextElementSibling.style.display = 'flex';
    }
    
    // Actualizar visibilidad de botones
    const prevBtn = document.getElementById('prevServiceBtn');
    const nextBtn = document.getElementById('nextServiceBtn');
    
    prevBtn.style.opacity = currentServiceIndex === 0 ? '0.5' : '1';
    nextBtn.style.opacity = currentServiceIndex === servicesData.length - 1 ? '0.5' : '1';
}

function navigateService(direction) {
    if (servicesData.length === 0) return;
    
    const newIndex = currentServiceIndex + direction;
    
    if (newIndex >= 0 && newIndex < servicesData.length) {
        currentServiceIndex = newIndex;
        updateGalleryModal();
    }
}

function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('active');
}


// SEO: Actualizar título dinámico para productos y servicios
function updatePageTitle(section) {
    const baseTitle = "Tecno Redes Sinú - Servicio Técnico y Venta de Computadores";
    const titles = {
        servicios: "Servicios Técnicos - Tecno Redes Sinú",
        productos: "Productos en Venta - Tecno Redes Sinú",
        inicio: baseTitle
    };
    document.title = titles[section] || baseTitle;
    
    // Actualizar meta description dinámicamente
    updateMetaDescription(section);
}

// SEO: Actualizar meta description dinámica
function updateMetaDescription(section) {
    const descriptions = {
        servicios: "Servicios técnicos profesionales para computadores en Lorica. Mantenimiento, reparación, eliminación de virus y soporte 24/7.",
        productos: "Computadores nuevos y usados con garantía en Lorica. Venta de equipos de cómputo con soporte técnico incluido.",
        inicio: "Expertos en mantenimiento, reparación y venta de computadores en Lorica, Córdoba. Servicio técnico 24/7 con garantía 100%."
    };
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    metaDescription.content = descriptions[section] || descriptions.inicio;
}

// SEO: Actualizar canonical URL para secciones
function updateCanonicalUrl(section) {
    const baseUrl = 'https://tecnoredessinu.netlify.app';
    const urls = {
        servicios: `${baseUrl}/#servicios`,
        productos: `${baseUrl}/#productos`,
        inicio: baseUrl
    };
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = urls[section] || baseUrl;
}

// SEO: Rastreo de eventos para Analytics
function trackSEOClick(element, category, action, label) {
    // Implementar Google Analytics o similar
    console.log('SEO Track:', category, action, label);
    
    // Para Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Modificar la función de scroll suave para incluir SEO
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // Mejorar el smooth scrolling con actualización SEO
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const section = this.getAttribute('href').replace('#', '');
                
                // Actualizar SEO para la sección
                updatePageTitle(section);
                updateCanonicalUrl(section);
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Rastreo SEO
                trackSEOClick(this, 'Navigation', 'section_click', section);
            }
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
    
    // Lazy loading para imágenes (mejora Core Web Vitals)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});