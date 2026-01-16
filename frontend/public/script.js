// API endpoint for fetching videos
const API_URL = '/api/videos';

// Dynamic list of video IDs
let videoIds = [];
let currentIndex = 0;
let isLoading = false;
let skipTimeout = null;
let ytPlayer = null;
let currentSearchTag = '';
let nextPageToken = null;
let isFetchingMore = false;

const player = document.getElementById('player');
const counter = document.getElementById('counter');
const placeholder = document.getElementById('placeholder');
const placeholderText = document.getElementById('placeholderText');
const tagInput = document.getElementById('tagInput');
const searchBtn = document.getElementById('searchBtn');
const searchBtnText = document.getElementById('searchBtnText');
const searchSpinner = document.getElementById('searchSpinner');
const currentTagDisplay = document.getElementById('currentTagDisplay');
const currentTagSpan = document.getElementById('currentTag');

// Called when YouTube API is ready
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

function fillSearch(topic) {
    tagInput.value = topic;
    searchVideos();
}

async function searchVideos() {
    const tag = tagInput.value.trim();
    if (!tag || isLoading) return;
    
    // Show loading state
    isLoading = true;
    searchBtn.disabled = true;
    searchBtnText.classList.add('hidden');
    searchSpinner.classList.remove('hidden');
    counter.innerHTML = '<span class="counter-badge">🔍 Searching for videos...</span>';
    placeholderText.innerText = 'Finding the best content for you...';
    player.src = '';
    
    try {
        const response = await fetch(`${API_URL}?tag=${encodeURIComponent(tag)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch videos');
        }
        
        if (data.videos && data.videos.length > 0) {
            videoIds = data.videos;
            currentIndex = 0;
            currentSearchTag = tag;
            nextPageToken = data.next_page_token || null;
            
            // Update UI
            currentTagSpan.innerText = tag;
            currentTagDisplay.classList.remove('hidden');
            placeholder.classList.add('hidden');
            
            loadVideo(0);
        } else {
            counter.innerHTML = '<span class="counter-badge">😕 No videos found for this topic</span>';
            placeholderText.innerText = 'No videos found. Try a different topic.';
            videoIds = [];
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        if (error.message && error.message.includes('quota')) {
            counter.innerHTML = '<span class="counter-badge">⚠️ API Quota Exceeded</span>';
            placeholderText.innerHTML = `
                <div style="text-align: center; max-width: 400px;">
                    <p style="margin-bottom: 1rem;">API quota has been exceeded for today.</p>
                    <p style="margin-bottom: 1rem; font-size: 0.9rem; opacity: 0.8;">The quota resets at midnight Pacific Time. Please try again later.</p>
                </div>
            `;
        } else {
            counter.innerHTML = '<span class="counter-badge">⚠️ Error loading videos</span>';
            placeholderText.innerText = `Error: ${error.message}. Please try again.`;
        }
    } finally {
        // Reset loading state
        isLoading = false;
        searchBtn.disabled = false;
        searchBtnText.classList.remove('hidden');
        searchSpinner.classList.add('hidden');
    }
}

function loadVideo(index) {
    if (videoIds.length === 0) return;
    
    // Clear any pending skip timeout
    if (skipTimeout) {
        clearTimeout(skipTimeout);
        skipTimeout = null;
    }
    
    // Bounds checking
    if (index < 0) index = 0;
    if (index >= videoIds.length) index = videoIds.length - 1;

    currentIndex = index;
    const videoId = videoIds[currentIndex];
    
    // Destroy old player if exists
    if (ytPlayer) {
        ytPlayer.destroy();
        ytPlayer = null;
    }
    
    placeholder.classList.add('hidden');
    
    // Create new YouTube player with event handlers
    ytPlayer = new YT.Player('player', {
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }
    });
    
    updateCounter();
}

function onPlayerReady(event) {
    // Player loaded successfully, clear any skip timeout
    if (skipTimeout) {
        clearTimeout(skipTimeout);
        skipTimeout = null;
    }
}

function onPlayerStateChange(event) {
    // YT.PlayerState.UNSTARTED = -1, could indicate unavailable video
    // If video is unstarted for too long, skip it
    if (event.data === -1) {
        // Set a timeout - if still unstarted after 3 seconds, skip
        skipTimeout = setTimeout(() => {
            console.log('Video appears unavailable, skipping...');
            skipUnavailableVideo();
        }, 3000);
    } else if (event.data === YT.PlayerState.PLAYING) {
        // Video is playing, clear any skip timeout
        if (skipTimeout) {
            clearTimeout(skipTimeout);
            skipTimeout = null;
        }
    }
}

function onPlayerError(event) {
    // Error codes: 2 = invalid video ID, 5 = HTML5 error, 100 = not found, 
    // 101/150 = embedding not allowed
    console.log('Player error:', event.data, '- skipping video');
    skipUnavailableVideo();
}

function skipUnavailableVideo() {
    // Remove the bad video from the list
    const badVideoId = videoIds[currentIndex];
    console.log(`Removing unavailable video: ${badVideoId}`);
    videoIds.splice(currentIndex, 1);
    
    if (videoIds.length === 0) {
        counter.innerHTML = '<span class="counter-badge">😕 No playable videos found</span>';
        placeholder.classList.remove('hidden');
        placeholderText.innerText = 'All videos were unavailable. Try a different topic.';
        return;
    }
    
    // Adjust index if needed
    if (currentIndex >= videoIds.length) {
        currentIndex = 0;
    }
    
    // Load next video
    loadVideo(currentIndex);
}

function updateCounter() {
    counter.innerHTML = `<span class="counter-badge">📺 Video ${currentIndex + 1} of ${videoIds.length}</span>`;
}

async function nextVideo() {
    if (videoIds.length === 0) return;
    
    if (currentIndex < videoIds.length - 1) {
        loadVideo(currentIndex + 1);
    } else if (nextPageToken && !isFetchingMore) {
        // Fetch more videos
        await fetchMoreVideos();
    } else if (!isFetchingMore) {
        // No more pages, loop back to start
        loadVideo(0); 
    }
}

async function fetchMoreVideos() {
    if (!currentSearchTag || !nextPageToken || isFetchingMore) return;
    
    const apiKey = getApiKey();
    if (!apiKey) return;
    
    isFetchingMore = true;
    counter.innerHTML = '<span class="counter-badge">🔄 Loading more videos...</span>';
    
    try {
        const response = await fetch(`${API_URL}?tag=${encodeURIComponent(currentSearchTag)}&page_token=${encodeURIComponent(nextPageToken)}&api_key=${encodeURIComponent(apiKey)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch more videos');
        }
        
        if (data.videos && data.videos.length > 0) {
            // Filter out duplicates
            const newVideos = data.videos.filter(id => !videoIds.includes(id));
            videoIds.push(...newVideos);
            nextPageToken = data.next_page_token || null;
            
            console.log(`Added ${newVideos.length} new videos, total: ${videoIds.length}`);
            
            // Load the next video
            if (newVideos.length > 0) {
                loadVideo(currentIndex + 1);
            } else if (nextPageToken) {
                // Got duplicates, try fetching more
                await fetchMoreVideos();
            } else {
                // No more videos, loop back
                loadVideo(0);
            }
        } else {
            // No more videos available
            nextPageToken = null;
            loadVideo(0);
        }
    } catch (error) {
        console.error('Error fetching more videos:', error);
        if (error.message && error.message.includes('quota')) {
            counter.innerHTML = '<span class="counter-badge">⚠️ API Quota Exceeded - Try again tomorrow or use a different API key</span>';
        } else {
            updateCounter();
        }
    } finally {
        isFetchingMore = false;
    }
}

function prevVideo() {
    if (videoIds.length === 0) return;
    
    if (currentIndex > 0) {
        loadVideo(currentIndex - 1);
    } else {
        // Loop to end
        loadVideo(videoIds.length - 1);
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Don't navigate if typing in the search input
    if (document.activeElement === tagInput) {
        return;
    }
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent page scrolling
        nextVideo();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent page scrolling
        prevVideo();
    }
});