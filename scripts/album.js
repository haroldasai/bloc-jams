
 var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;
 
     var $row = $(template);
     
     var clickHandler = function() {
        
         var songNumber = parseInt($(this).attr('data-song-number'));

	     if (currentlyPlayingSongNumber !== null) {
		     // Revert to song number for currently playing song because user started playing new song.
             var currentlyPlayingCell =  getSongNumberCell(currentlyPlayingSongNumber);
		     //var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
		     currentlyPlayingCell.html(currentlyPlayingSongNumber);
	     }
	     if (currentlyPlayingSongNumber !== songNumber) {
		     // Switch from Play -> Pause button to indicate new song is playing.
		     $(this).html(pauseButtonTemplate);
             //refactor using setSong();
             setSong(songNumber);
             $('.volume .fill').css('width', currentVolume+'%');
             $('.volume .thumb').css('left', currentVolume+'%');
             currentSoundFile.play();
             updateSeekBarWhileSongPlays();
		     //currentlyPlayingSongNumber = songNumber;
             //currentSongFromAlbum = currentAlbum.songs[songNumber-1];
             updatePlayerBarSong();
	     } else if (currentlyPlayingSongNumber === songNumber) {
             if(currentSoundFile.isPaused()){
                 $(this).html(pauseButtonTemplate); 
                 $('.main-controls .play-pause').html(playerBarPauseButton);
                 currentSoundFile.play();
                 updateSeekBarWhileSongPlays();
             } else {
                 $(this).html(playButtonTemplate); 
                 $('.main-controls .play-pause').html(playerBarPlayButton);
                 currentSoundFile.pause();
             }
             //setSong(null);
		     //currentlyPlayingSongNumber = null;
             //currentSongFromAlbum = null;
	     }       
     };
     
     var onHover = function(event) {
         /* Harold's code 
         var $songItem = $(this).find('.song-item-number');
             
         if ($songItem.attr('data-song-number') !== currentlyPlayingSong) {
            $songItem.html(playButtonTemplate);
         }
         */
         var songNumberCell = $(this).find('.song-item-number');
         var songNumber = parseInt(songNumberCell.attr('data-song-number'));

         if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
         }
     };
     var offHover = function(event) {
         /* Harold's code
         var $songItem = $(this).find('.song-item-number');
         var songItemNumber = $songItem.attr('data-song-number');
         if(songItemNumber !== currentlyPlayingSong) {
             $songItem.html(songItemNumber);
         }
         */
         var songNumberCell = $(this).find('.song-item-number');
         var songNumber = parseInt(songNumberCell.attr('data-song-number'));

         if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
         }
         
         console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
     };
     
     $row.find('.song-item-number').click(clickHandler);
     $row.hover(onHover, offHover);
     return $row;
 };

 var setCurrentAlbum = function(album) {
     // #1
     currentAlbum = album;
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
 
     // #2
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
 
     // #3
     $albumSongList.empty();
 
     // #4
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
 };

 var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         // #10
         currentSoundFile.bind('timeupdate', function(event) {
             // #11
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
         });
     }
 };

 var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };

 var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
     $seekBars.click(function(event) {
         // #3
         var offsetX = event.pageX - $(this).offset().left;
         var barWidth = $(this).width();
         // #4
         var seekBarFillRatio = offsetX / barWidth;
 
         // #5
         
         if($(this).parent().prop('className') == 'seek-control' ) {
             seek(seekBarFillRatio * currentSoundFile.getDuration());
         } else {
             setVolume(seekBarFillRatio * 100);             
         }
         
         updateSeekPercentage($(this), seekBarFillRatio);
     });
     
     $seekBars.find('.thumb').mousedown(function(event) {
         // #8
         var $seekBar = $(this).parent();
 
         // #9
         $(document).bind('mousemove.thumb', function(event){
             var offsetX = event.pageX - $seekBar.offset().left;
             var barWidth = $seekBar.width();
             var seekBarFillRatio = offsetX / barWidth;
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
         });
 
         // #10
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
     
     
     
 };

 var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };

 var nextSong = function() {
     /*Harold's code
     var currentPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');		          
     
     var nextSongIndex = trackIndex(currentAlbum, currentSongFromAlbum)+1;
     var nextSongIndex = nextSongIndex%(currentAlbum.songs.length);
     currentSongFromAlbum = currentAlbum.songs[nextSongIndex];
     updatePlayerBarSong();
     currentPlayingCell.html(currentlyPlayingSongNumber);
     
     var nextPlayingCell = $('.song-item-number[data-song-number="' + nextSongIndex+1 + '"]');
     nextPlayingCell.html(pauseButtonTemplate);
     */
     
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     // Note that we're _incrementing_ the song here
     currentSongIndex++;

     if (currentSongIndex >= currentAlbum.songs.length) {
         currentSongIndex = 0;
     }

     // Save the last song number before changing it
     var lastSongNumber = currentlyPlayingSongNumber;

     // Set a new current song
     setSong(currentSongIndex + 1);
     currentSoundFile.play();
     updateSeekBarWhileSongPlays();
     //currentlyPlayingSongNumber = currentSongIndex + 1;
     //currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

     // Update the Player Bar information
     updatePlayerBarSong();

     var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
     //var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
     //var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

     $nextSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);     
 };

 var previousSong = function() {
     
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     // Note that we're _decrementing_ the song here
     currentSongIndex--;
     
     if (currentSongIndex < 0 ) {
         currentSongIndex = currentAlbum.songs.length-1;
     }
     
     var lastSongNumber = currentlyPlayingSongNumber;
     
     setSong(currentSongIndex + 1);
     currentSoundFile.play();
     updateSeekBarWhileSongPlays();
     //currentlyPlayingSongNumber = currentSongIndex + 1;
     //currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
     
     updatePlayerBarSong();
     
     //$('.main-controls .play-pause').html(playerBarPauseButton);
     
     var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
     //var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
     //var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

     $previousSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
 };

 var updatePlayerBarSong = function(){
     
     $('.currently-playing .song-name').text(currentSongFromAlbum.title);
     $('.currently-playing .artist-name').text(currentAlbum.artist);
     $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
     $('.main-controls .play-pause').html(playerBarPauseButton);
 };

 var setSong = function(songNumber) {
     if (currentSoundFile) {
         currentSoundFile.stop();
     }
     if(songNumber!==null) {
        currentlyPlayingSongNumber = songNumber;
        currentSongFromAlbum = currentAlbum.songs[songNumber-1];
        
        currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
           // #2
           formats: [ 'mp3' ],
           preload: true
        });
         
        setVolume(currentVolume); 
         
     } else {
        currentlyPlayingSongNumber = null;
        currentSongFromAlbum = null;
     }
     
     
 };

 var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
 }

 var setVolume = function(volume) {
     if (currentSoundFile) {
         currentSoundFile.setVolume(volume);
     }
 };
 
 var getSongNumberCell = function(number) {
     return $('.song-item-number[data-song-number="' + number + '"]');     
 }

 var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
 var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
 var playerBarPlayButton = '<span class="ion-play"></span>';
 var playerBarPauseButton = '<span class="ion-pause"></span>';

 var currentAlbum = null;
 var currentlyPlayingSongNumber = null;
 var currentSongFromAlbum = null;
 var currentSoundFile = null;
 var currentVolume = 80;

 var $previousButton = $('.main-controls .previous');
 var $nextButton = $('.main-controls .next');

 $(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     setupSeekBars();
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);     
 });