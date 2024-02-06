import React, { useEffect, useRef, useState } from 'react';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import ProgressBar from './Progress';


const Player = () => {
  const [playlist, setPlaylist] = useState([]);
  const [isplaying, setisplaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    localStorage.getItem('currentTrackIndex') !== null
      ? parseInt(localStorage.getItem('currentTrackIndex'))
      : 0
  );

  const [currentTime, setCurrentTime] = useState(
    localStorage.getItem('currentPlaybackPosition') !== null
      ? parseFloat(localStorage.getItem('currentPlaybackPosition'))
      : 0
  );
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const storedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];

    if (storedPlaylist.length > 0) {
      setCurrentTrackIndex(
        localStorage.getItem('currentTrackIndex') !== null
          ? parseInt(localStorage.getItem('currentTrackIndex'))
          : 0
      );
      setPlaylist(storedPlaylist);
      audioRef.current.src = storedPlaylist[currentTrackIndex]?.url || '';

      audioRef.current.load();
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
        if (isplaying) {
          audioRef.current.play().catch((error) => {
            console.error('Play error:', error);
          });
        }
      };
      const storedPlaybackPosition = localStorage.getItem('currentPlaybackPosition');
      if (storedPlaybackPosition && isplaying) {
        audioRef.current.currentTime = storedPlaybackPosition;
        audioRef.current.play().catch((error) => {
          console.error('Play error:', error);
        });
      }
    }

  
    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audioRef.current.duration);
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('durationchange', handleDurationChange);

    
    return () => {
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('durationchange', handleDurationChange);
    };
  }, [currentTrackIndex, isplaying]);

  const formatTime = (time) => {
    if (isNaN(time)) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    if (currentTrackIndex !== null) {
      setCurrentTrackIndex(currentTrackIndex);
      audioRef.current.src = playlist[currentTrackIndex]?.url || '';
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (isplaying) {
      audioRef.current.currentTime = localStorage.getItem('currentPlaybackPosition') || 0;
      audioRef.current.play().catch((error) => {
        console.error('Play error:', error);
      });
    }
  }, [isplaying, playlist, currentTrackIndex]);

  const handlePlayPause = async () => {
    if (isplaying) {
      audioRef.current.pause();
      setCurrentTime(audioRef.current.currentTime);
      localStorage.setItem('currentPlaybackPosition', audioRef.current.currentTime);
    } else {
    
      audioRef.current.src = '';

      audioRef.current.src = playlist[currentTrackIndex]?.url || '';

      audioRef.current.load();
      audioRef.current.currentTime = currentTime;
  

      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Play error:', error);
      }
    }
    setisplaying(!isplaying);
  };
  

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newPlaylist = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPlaylist((prevPlaylist) => [...prevPlaylist, ...newPlaylist]);
    setCurrentTrackIndex(0);

    localStorage.setItem('playlist', JSON.stringify([...playlist, ...newPlaylist]));

    audioRef.current.src = playlist.length === 0 ? newPlaylist[0]?.url || '' : playlist[0]?.url || '';
  };

  const handleSkipNext = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    audioRef.current.src = playlist[nextIndex]?.url || '';
    
  
    audioRef.current.load();
    audioRef.current.play().catch((error) => {
      console.error('Play error:', error);
    });
  };
  const handleSeek = (seekTime) => {
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    localStorage.setItem('currentPlaybackPosition', seekTime);

    if (isplaying) {
      audioRef.current.play().catch((error) => {
        console.error('Play error:', error);
      });
    }
  };


  const handleSkipPrevious = () => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
  
    
    audioRef.current.src = '';
  

    audioRef.current.src = playlist[prevIndex]?.url || '';
 
    audioRef.current.onloadedmetadata = null;
  
  
    audioRef.current.load();

    audioRef.current.onloadedmetadata = () => {
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
  

      audioRef.current.play().catch((error) => {
        console.error('Play error:', error);
      });
    };
  };
  
  


  useEffect(() => {
    const handleEnded = () => {
      handleSkipNext();
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist]);



  return (
    <>
      <div>
        <h1 className='text-3xl font-bold text-center '>Music Player</h1>
      </div>
      <div className='flex flex-col lg:flex-row h-1/3 bg-yellow-200 items-center justify-center p-16' >
     
        <div className='flex-grow-1 lg:w-4/6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl backdrop-filter backdrop-blur-lg bg-opacity-5 border border-gray-100'>
          <div className='flex flex-col items-center justify-start h-full '>
            <div className='lg:rounded-full bg-red-700 lg:h-64 lg:w-64 sm:rounded-full sm:h-36 sm:w-36 md:rounded-full md:w-48 md:h-48 mt-10'>
              <img src="/music.avif" alt="music" className='w-full h-full object-cover rounded-full' />
            </div>
            <h1 className='text-center mt-2'>Now Playing - {playlist[currentTrackIndex]?.name || 'No Track'}</h1>
            <input type='file' accept='.mp3' onChange={handleFileChange} multiple />
            <div className='p-16'>
              <SkipPreviousRoundedIcon onClick={handleSkipPrevious} style={{ fontSize: 50 }} />
              {isplaying ? (
                <PauseRoundedIcon onClick={handlePlayPause} style={{ fontSize: 50 }} />
              ) : (
                <PlayArrowRoundedIcon onClick={handlePlayPause} style={{ fontSize: 50 }} />
              )}
              <SkipNextRoundedIcon onClick={handleSkipNext} style={{ fontSize: 50 }} />
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} /> 
              <audio ref={audioRef} />
            </div>
          </div>
        </div>

        <div className='lg:w-2/6 bg-slate-900 text-white rounded-2xl'>
          <h2 className='text-center text-xl mb-2 mt-2'>Playlist</h2>
          <ul className='pl-8'>
  {playlist.map((track, index) => (
    <li
      key={index}

      className={` mt-5 mb-5 ${currentTrackIndex === index ? 'text-blue-600' : ''}`}
    >
      <p className=''>* {track.name}</p>
    </li>
  ))}
</ul>
        </div>
      </div>
    </>
  );
};

export default Player;