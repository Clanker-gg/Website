// StudyWithClankers.jsx
import React, { useState, useEffect, useRef } from 'react';
import './StudyWithClankers.css';

const StudyWithClankers = ({ onBack }) => {
  const [videoIds, setVideoIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchTag, setCurrentSearchTag] = useState('');
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [counterMessage, setCounterMessage] = useState('Enter a topic to get started');
  const [placeholderText, setPlaceholderText] = useState('Search for any topic to start exploring');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  
  const playerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const skipTimeoutRef = useRef(null);

  const API_URL = 'https://34.150.25.115.sslip.io/api/videos';
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      setIsYouTubeReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready');
      setIsYouTubeReady(true);
    };

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [videoIds, currentIndex, nextPageToken, isFetchingMore]);

  const fillSearch = (topic) => {
    setSearchInput(topic);
    searchVideos(topic);
  };

  const searchVideos = async (tag = searchInput) => {
    const searchTag = tag.trim();
    if (!searchTag || isLoading) return;

    setIsLoading(true);
    setCounterMessage('🔍 Searching for videos...');
    setPlaceholderText('Finding the best content for you...');

    try {
      const response = await fetch(`${API_URL}?tag=${encodeURIComponent(searchTag)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos');
      }

      if (data.videos && data.videos.length > 0) {
        setVideoIds(data.videos);
        setCurrentIndex(0);
        setCurrentSearchTag(searchTag);
        setNextPageToken(data.next_page_token || null);
        setShowPlaceholder(false);
        loadVideo(0, data.videos);
      } else {
        setCounterMessage('😔 No videos found for this topic');
        setPlaceholderText('No videos found. Try a different topic.');
        setVideoIds([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      if (error.message?.includes('quota')) {
        setCounterMessage('⚠️ API Quota Exceeded');
        setPlaceholderText('The daily API quota has been exceeded. Please try again tomorrow when the quota resets.');
      } else {
        setCounterMessage('⚠️ Error loading videos');
        setPlaceholderText(`Error: ${error.message}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideo = (index, videos = videoIds) => {
    if (videos.length === 0) return;

    // Check if YouTube API is ready
    if (!window.YT || !window.YT.Player) {
      console.log('YouTube API not ready yet, waiting...');
      setTimeout(() => loadVideo(index, videos), 500);
      return;
    }

    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = null;
    }

    let validIndex = Math.max(0, Math.min(index, videos.length - 1));
    setCurrentIndex(validIndex);
    const videoId = videos[validIndex];

    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
      ytPlayerRef.current = null;
    }

    setShowPlaceholder(false);

    ytPlayerRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: () => {
          if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
            skipTimeoutRef.current = null;
          }
        },
        onStateChange: (event) => {
          if (event.data === -1) {
            skipTimeoutRef.current = setTimeout(() => {
              console.log('Video appears unavailable, skipping...');
              skipUnavailableVideo();
            }, 3000);
          } else if (event.data === window.YT.PlayerState.PLAYING) {
            if (skipTimeoutRef.current) {
              clearTimeout(skipTimeoutRef.current);
              skipTimeoutRef.current = null;
            }
          }
        },
        onError: (event) => {
          console.log('Player error:', event.data, '- skipping video');
          skipUnavailableVideo();
        }
      }
    });

    setCounterMessage(`📺 Video ${validIndex + 1} of ${videos.length}`);
  };

  const skipUnavailableVideo = () => {
    const newVideoIds = [...videoIds];
    const badVideoId = newVideoIds[currentIndex];
    console.log(`Removing unavailable video: ${badVideoId}`);
    newVideoIds.splice(currentIndex, 1);
    
    setVideoIds(newVideoIds);

    if (newVideoIds.length === 0) {
      setCounterMessage('😔 No playable videos found');
      setShowPlaceholder(true);
      setPlaceholderText('All videos were unavailable. Try a different topic.');
      return;
    }

    const newIndex = currentIndex >= newVideoIds.length ? 0 : currentIndex;
    loadVideo(newIndex, newVideoIds);
  };

  const fetchMoreVideos = async () => {
    if (!currentSearchTag || !nextPageToken || isFetchingMore) return;

    setIsFetchingMore(true);
    setCounterMessage('🔄 Loading more videos...');

    try {
      const response = await fetch(`${API_URL}?tag=${encodeURIComponent(currentSearchTag)}&page_token=${encodeURIComponent(nextPageToken)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch more videos');
      }

      if (data.videos && data.videos.length > 0) {
        const newVideos = data.videos.filter(id => !videoIds.includes(id));
        const updatedVideos = [...videoIds, ...newVideos];
        setVideoIds(updatedVideos);
        setNextPageToken(data.next_page_token || null);

        console.log(`Added ${newVideos.length} new videos, total: ${updatedVideos.length}`);

        if (newVideos.length > 0) {
          loadVideo(currentIndex + 1, updatedVideos);
        } else if (data.next_page_token) {
          await fetchMoreVideos();
        } else {
          loadVideo(0, updatedVideos);
        }
      } else {
        setNextPageToken(null);
        loadVideo(0);
      }
    } catch (error) {
      console.error('Error fetching more videos:', error);
      if (error.message?.includes('quota')) {
        setCounterMessage('⚠️ API Quota Exceeded - Try again tomorrow');
      } else {
        setCounterMessage(`📺 Video ${currentIndex + 1} of ${videoIds.length}`);
      }
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleNext = async () => {
    if (videoIds.length === 0) return;

    if (currentIndex < videoIds.length - 1) {
      loadVideo(currentIndex + 1);
    } else if (nextPageToken && !isFetchingMore) {
      await fetchMoreVideos();
    } else if (!isFetchingMore) {
      loadVideo(0);
    }
  };

  const handlePrevious = () => {
    if (videoIds.length === 0) return;

    if (currentIndex > 0) {
      loadVideo(currentIndex - 1);
    } else {
      loadVideo(videoIds.length - 1);
    }
  };

  return (
    <div className="app-container">
      <div className="background-gradient-1" />
      <div className="background-gradient-2" />
      <div className="top-left">
        <button onClick={onBack} className="nav-btn" >
          ← Back
        </button>
      </div>
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
              </svg>
            </div>
          </div>
          <h1 className="title">Study with clankers</h1>
          <p className="subtitle">Discover educational content that matters</p>

          {currentSearchTag && (
            <p className="current-tag-container">
              <span className="tag-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="tag-icon" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                </svg>
                <span className="current-tag">{currentSearchTag}</span>
              </span>
            </p>
          )}

          <p className="keyboard-hint">
            Navigate with <span className="kbd">↑</span> <span className="kbd">↓</span> or arrow buttons
          </p>
          <p className="counter-container">
            <span className="counter-badge">{counterMessage}</span>
          </p>
        </div>

        {/* Video Container */}
        <div className="video-container">
          <div ref={playerRef} id="player"></div>
          
          {showPlaceholder && (
            <div className="placeholder">
              <div className="placeholder-content">
                <div className="search-icon-container">
                  <div className="search-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="search-icon" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </div>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
                    className="search-input"
                    placeholder="What do you want to learn today?"
                  />
                  <button onClick={() => searchVideos()} disabled={isLoading} className="search-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                    {isLoading ? (
                      <span className="loading-spinner" />
                    ) : (
                      <span>Discover</span>
                    )}
                  </button>
                </div>
                <p className="placeholder-text">{placeholderText}</p>
                <div className="suggestion-chips">
                  <span className="chip" onClick={() => fillSearch('psychology')}>🧠 Psychology</span>
                  <span className="chip" onClick={() => fillSearch('history')}>📜 History</span>
                  <span className="chip" onClick={() => fillSearch('science')}>🔬 Science</span>
                  <span className="chip" onClick={() => fillSearch('philosophy')}>💭 Philosophy</span>
                  <span className="chip" onClick={() => fillSearch('mathematics')}>📐 Mathematics</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button onClick={handlePrevious} className="nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
            </svg>
            Previous
          </button>
          <button onClick={handleNext} className="nav-btn">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 1a.5.5 0 0 0-.5.5v11.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 13.293V1.5a.5.5 0 0 0-.5-.5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyWithClankers;