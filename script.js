// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });
});

// Add scroll effect to header
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100px)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// RSS Feed URL
const RSS_FEED_URL = 'https://popygcom.wordpress.com/feed/';

// Function to create a loading state
function createLoadingState() {
    const loadingCard = document.createElement('div');
    loadingCard.className = 'project-card loading';
    loadingCard.innerHTML = `
        <div class="loading-placeholder">
            <div class="loading-image"></div>
            <div class="loading-title"></div>
            <div class="loading-text"></div>
        </div>
    `;
    return loadingCard;
}

// Function to create an error state
function createErrorState() {
    const errorCard = document.createElement('div');
    errorCard.className = 'project-card error';
    errorCard.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>Unable to load articles. Please try again later.</p>
            <button onclick="fetchRSSFeed()" class="retry-button">
                <i class="fas fa-sync-alt"></i> Retry
            </button>
        </div>
    `;
    return errorCard;
}

// Function to fetch and parse RSS feed
async function fetchRSSFeed() {
    const articlesSection = document.querySelector('#projects .project-grid');
    
    // Show loading state
    articlesSection.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        articlesSection.appendChild(createLoadingState());
    }
    
    try {
        // Using RSS to JSON API service
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('RSS Feed Response:', data); // Debug log
        
        if (data.status !== 'ok') {
            throw new Error('RSS feed service error: ' + data.message);
        }
        
        // Clear loading state
        articlesSection.innerHTML = '';
        
        if (!data.items || data.items.length === 0) {
            articlesSection.appendChild(createErrorState());
            return;
        }
        
        // Process up to 3 latest articles
        for (let i = 0; i < Math.min(3, data.items.length); i++) {
            const item = data.items[i];
            console.log('Processing item:', i + 1, item); // Debug log
            
            const title = item.title || 'No Title';
            const link = item.link || '#';
            const description = item.description || 'No description available';
            
            // Get image URL from thumbnail or content
            let imageUrl = item.thumbnail || 'images/placeholder.png';
            
            // If no thumbnail, try to extract from content
            if (imageUrl === 'images/placeholder.png' && item.content) {
                const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }
            
            console.log('Article details:', { title, link, imageUrl }); // Debug log
            
            // Create article card
            const articleCard = document.createElement('div');
            articleCard.className = 'project-card';
            articleCard.innerHTML = `
                <div class="card-image">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='images/placeholder.png'">
                </div>
                <h3>${title}</h3>
                <p>${description.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
                <a href="${link}" class="read-more" target="_blank">Read More <i class="fas fa-arrow-right"></i></a>
            `;
            
            articlesSection.appendChild(articleCard);
        }
        
        // Add refresh button only if it doesn't exist
        const existingButton = articlesSection.parentElement.querySelector('.refresh-button');
        if (!existingButton) {
            const refreshButton = document.createElement('button');
            refreshButton.className = 'refresh-button';
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Articles';
            refreshButton.onclick = fetchRSSFeed;
            articlesSection.parentElement.appendChild(refreshButton);
        }
        
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        articlesSection.innerHTML = '';
        const errorCard = createErrorState();
        errorCard.querySelector('.error-message p').textContent = `Error: ${error.message}. Please try again later.`;
        articlesSection.appendChild(errorCard);
    }
}

// Fetch RSS feed when page loads
document.addEventListener('DOMContentLoaded', fetchRSSFeed);

// Refresh feed every 30 minutes
setInterval(fetchRSSFeed, 30 * 60 * 1000); 