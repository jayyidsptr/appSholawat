// Initialize BookmarksManager
const bookmarksManager = new BookmarksManager();

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

// PWA Install Handler
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.classList.remove('hidden');
        installButton.addEventListener('click', async () => {
            installButton.classList.add('hidden');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        });
    }
});

// API Configuration
const API_BASE_URL = 'https://db-sholawat.vercel.app/api';

// Latest Sholawat Functions
async function fetchLatestSholawat() {
    try {
        const response = await fetch(`${API_BASE_URL}/sholawat`);
        const data = await response.json();
        const latestSholawat = data
            .sort((a, b) => new Date(b.id) - new Date(a.id))
            .slice(0, 3);
        renderLatestSholawat(latestSholawat);
    } catch (error) {
        console.error('Error fetching latest sholawat:', error);
    }
}

function renderLatestSholawat(sholawatList) {
    const container = document.getElementById('latestSholawat');
    container.innerHTML = '';

    sholawatList.forEach(sholawat => {
        const card = document.createElement('div');
        card.className = 'bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 hover:bg-opacity-20 transition-all duration-200 cursor-pointer';
        card.onclick = () => showDetail(sholawat.id);
        card.innerHTML = `
            <div class="text-sm text-emerald-200 mb-2">${sholawat.kategori || 'Tidak ada kategori'}</div>
            <h3 class="text-xl font-semibold mb-3">${sholawat.judul}</h3>
            <p class="text-emerald-100 text-sm mb-4">${sholawat.author || 'Unknown'}</p>
            <div class="text-right arabic-text text-lg">${sholawat.lirik[0].arab}</div>
        `;
        container.appendChild(card);
    });
}

// Categories Functions
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log('Categories data:', categories);
        
        if (!Array.isArray(categories)) {
            throw new Error('Invalid categories data format');
        }
        
        renderCategories(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        showError('Gagal mengambil data kategori');
    }
}

function renderCategories(categories) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    select.innerHTML = '<option value="">Semua Kategori</option>';
    categories.sort((a, b) => a.localeCompare(b));
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Main Sholawat Functions with Offline Support
async function fetchSholawat(search = '', category = '') {
    showLoading();
    try {
        let url = `${API_BASE_URL}/sholawat`;
        const params = new URLSearchParams();
        
        if (search?.trim()) {
            params.append('search', search.trim());
        }
        
        if (category?.trim()) {
            params.append('category', category.trim());
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            await caches.open('api-cache-v1').then(cache => {
                cache.put(url, new Response(JSON.stringify(data)));
            });
            renderSholawatList(data);
        } catch (error) {
            console.log('Fetching from cache...');
            const cache = await caches.open('api-cache-v1');
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                const data = await cachedResponse.json();
                renderSholawatList(data);
            } else {
                throw new Error('No cached data available');
            }
        }
    } catch (error) {
        console.error('Error fetching sholawat:', error);
        showError('Gagal mengambil data sholawat');
        renderSholawatList([]);
    } finally {
        hideLoading();
    }
}

async function renderSholawatList(sholawatList) {
    // Sort the list alphabetically by title
    const sortedList = [...sholawatList].sort((a, b) => 
        a.judul.toLowerCase().localeCompare(b.judul.toLowerCase(), 'id')
    );

    // Determine which container to use based on visibility
    const isBookmarkView = document.getElementById('bookmarksContent').classList.contains('hidden') === false;
    const container = isBookmarkView 
        ? document.getElementById('bookmarksList')
        : document.getElementById('sholawatList');
    
    container.innerHTML = '';

    if (sortedList.length === 0) {
        const emptyMessage = isBookmarkView
            ? 'Tidak ada sholawat yang disimpan'
            : 'Tidak ada sholawat ditemukan';
            
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">${emptyMessage}</h3>
                ${isBookmarkView ? `
                    <p class="mt-1 text-sm text-gray-500">Klik ikon bookmark pada sholawat untuk menyimpannya</p>
                ` : ''}
            </div>
        `;
        return;
    }

    for (const sholawat of sortedList) {
        const isBookmarked = await bookmarksManager.isBookmarked(sholawat.id);
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200';
        card.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900">${sholawat.judul}</h3>
                        <p class="mt-1 text-sm text-emerald-600">${sholawat.kategori || 'Tidak ada kategori'}</p>
                    </div>
                    <button class="bookmark-btn p-2 rounded-full hover:bg-gray-100" data-id="${sholawat.id}">
                        <svg class="w-6 h-6 ${isBookmarked ? 'text-emerald-600' : 'text-gray-400'}" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                        </svg>
                    </button>
                </div>
                <div class="text-right arabic-text text-lg text-gray-800 mb-4">${sholawat.lirik[0].arab}</div>
                <div class="text-sm text-gray-600 mb-4">${sholawat.lirik[0].latin}</div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${sholawat.author || 'Unknown'}</span>
                    <button onclick="showDetail('${sholawat.id}')" 
                            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                        Lihat Detail
                    </button>
                </div>
            </div>
        `;

        // Add bookmark button event listener
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (await bookmarksManager.isBookmarked(sholawat.id)) {
                await bookmarksManager.removeBookmark(sholawat.id);
                bookmarkBtn.querySelector('svg').classList.remove('text-emerald-600');
                bookmarkBtn.querySelector('svg').classList.add('text-gray-400');
                bookmarkBtn.querySelector('svg').setAttribute('fill', 'none');
                
                // If we're in bookmarks tab, remove the card
                if (isBookmarkView) {
                    card.classList.add('opacity-0');
                    setTimeout(() => {
                        card.remove();
                        if (container.children.length === 0) {
                            renderSholawatList([]);
                        }
                    }, 300);
                }
            } else {
                await bookmarksManager.addBookmark(sholawat);
                bookmarkBtn.querySelector('svg').classList.add('text-emerald-600');
                bookmarkBtn.querySelector('svg').classList.remove('text-gray-400');
                bookmarkBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            }
        });

        container.appendChild(card);
    }
}

// Event Listeners for Navigation
document.addEventListener('DOMContentLoaded', function() {
    const homeLink = document.getElementById('homeLink');
    const bookmarksTab = document.getElementById('bookmarksTab');
    const homeContent = document.getElementById('homeContent');
    const bookmarksContent = document.getElementById('bookmarksContent');

    // Home link click handler
    homeLink.addEventListener('click', function() {
        homeContent.classList.remove('hidden');
        bookmarksContent.classList.add('hidden');
        // Refresh home content
        fetchLatestSholawat();
        fetchSholawat();
    });

    // Bookmarks tab click handler
    bookmarksTab.addEventListener('click', async function() {
        const isBookmarkView = !bookmarksContent.classList.contains('hidden');
        
        if (!isBookmarkView) {
            homeContent.classList.add('hidden');
            bookmarksContent.classList.remove('hidden');
            const bookmarks = await bookmarksManager.getBookmarks();
            renderSholawatList(bookmarks);
        } else {
            homeContent.classList.remove('hidden');
            bookmarksContent.classList.add('hidden');
            fetchLatestSholawat();
            fetchSholawat();
        }
    });
});

// Detail Modal Functions
async function showDetail(id) {
    showLoading();
    try {
        let sholawat;
        try {
            const response = await fetch(`${API_BASE_URL}/sholawat/${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            sholawat = await response.json();
            // Cache the detail response
            await caches.open('api-cache-v1').then(cache => {
                cache.put(`${API_BASE_URL}/sholawat/${id}`, new Response(JSON.stringify(sholawat)));
            });
        } catch (error) {
            console.log('Fetching detail from cache...');
            const cache = await caches.open('api-cache-v1');
            const cachedResponse = await cache.match(`${API_BASE_URL}/sholawat/${id}`);
            if (cachedResponse) {
                sholawat = await cachedResponse.json();
            } else {
                throw new Error('No cached detail available');
            }
        }
        
        document.getElementById('modalTitle').textContent = sholawat.judul;
        
        const content = document.getElementById('modalContent');
        content.innerHTML = `
            <div class="space-y-6">
                <div class="bg-emerald-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-900 mb-3">Informasi</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex items-center">
                            <svg class="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span class="text-gray-600">Kategori:</span>
                            <span class="ml-2 text-gray-900">${sholawat.kategori || '-'}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span class="text-gray-600">Author:</span>
                            <span class="ml-2 text-gray-900">${sholawat.author || '-'}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span class="text-gray-600">Nada:</span>
                            <span class="ml-2 text-gray-900">${sholawat.nada || '-'}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span class="text-gray-600">Source:</span>
                            <span class="ml-2 text-gray-900">${sholawat.source || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="font-semibold text-gray-900 mb-4">Lirik</h3>
                    <div class="space-y-6">
                        ${sholawat.lirik.map((bait, index) => `
                            <div class="bg-gray-50 p-6 rounded-lg">
                                <div class="text-right text-2xl arabic-text leading-loose" dir="rtl">${bait.arab}</div>
                                <div class="mt-3 text-emerald-600 font-medium">${bait.latin}</div>
                                <div class="mt-2 text-gray-600">${bait.terjemahan}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 mt-6">
                    ${sholawat.youtube_link ? `
                        <a href="${sholawat.youtube_link}" target="_blank" 
                           class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Tonton di YouTube
                        </a>
                    ` : ''}
                    ${sholawat.audio_link ? `
                        <a href="${sholawat.audio_link}" target="_blank" 
                           class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            Dengarkan Audio
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('detailModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching sholawat detail:', error);
        showError('Gagal mengambil detail sholawat');
    } finally {
        hideLoading();
    }
}

// UI Helper Functions
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const existingError = document.querySelector('.error-toast');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transform = 'translateY(100%)';
        errorDiv.style.transition = 'all 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', debounce((e) => {
    const category = document.getElementById('categoryFilter').value;
    fetchSholawat(e.target.value, category);
}, 300));

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const search = document.getElementById('searchInput').value;
    fetchSholawat(search, e.target.value);
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLatestSholawat();
    fetchCategories();
    fetchSholawat();
});