angular.module('VagalumeFM', ['ionic'])

.run(function($ionicPlatform, $timeout, Player) {
	$ionicPlatform.ready(function() {
		// Splashcreen
		$timeout(function() {
			navigator.splashscreen.hide();
		}, 500);

		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}

		function events(action) {
			switch(action) {
				case 'music-controls-headset-unplugged':
					Player.pause();
				break;
				case 'music-controls-close':
					MusicControls.destroy(function() {
						Player.pause();
					});
            	break;
        		case 'music-controls-play':
        			Player.play();
				break;
				case 'music-controls-pause':
        			Player.pause();
				break;
				case 'music-controls-favorite':
					MusicControls.updateIsFavorite(true);
					$rootScope.favoriteRadio($rootScope.radio);
				break;
				case 'music-controls-not-favorite':
					MusicControls.updateIsFavorite(false);
					$rootScope.favoriteRadio($rootScope.radio);
				break;
			}
		}

		MusicControls.subscribe(events);
		MusicControls.listen();
	});
})

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$ionicConfigProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $ionicConfigProvider){
	// URL padrão de redirecionamento
	$urlRouterProvider.otherwise('/player');

	// Configuração de rota
	$stateProvider
		.state('player', {
			url: '/player',
			templateUrl: 'player.html',
			controller: 'PlayerController'		
		})
}])

.constant('RadioURL', false)

// Controller
.controller('PlayerController', function($scope, $rootScope, $timeout, $http, $ionicSlideBoxDelegate, Player, RadioModel, ControlEvents, ButtonModel, RadioURL) {
	// Função quando muda a TAB
	var slideHasChanged = function(index) {
		$scope.currentTab = index;
	}
	,   buildRecentSongs = function() {
		if ($rootScope.radio.mapSongs && Object.keys($rootScope.radio.mapSongs).length) {
			for (var date in $rootScope.radio.mapSongs) {
				for (var i = 0; i < $rootScope.radio.mapSongs[date].length; i++) {
					var song = $rootScope.radio.mapSongs[date][i];
					if (song.url) {
						var bandURL = song.url.match(/^\/([^\/]+)\/([^\/\.]+)/)[1]
						,   songURL = song.url.match(/^\/([^\/]+)\/([^\/\.]+)/)[2];

						$rootScope.radio.mapSongs[date][i].bandURL = bandURL;
					}
					if (song.band) {
						$rootScope.radio.mapSongs[date][i].link = 'intent://lyrics/'+bandURL+'/'+songURL+'/'+song.id+'#Intent;scheme=vagalume;package=br.com.vagalume.android;S.browser_fallback_url=http%3A%2F%2Fm.vagalume.com.br%2F'+bandURL+'%2F'+songURL+'.html;launchFlags=0x8080000;end';
						$rootScope.radio.mapSongs[date][i].background = 'background-image: url(http://s2.vagalume.com/'+bandURL+'/images/'+bandURL+'.jpg)';
						$rootScope.radio.mapSongs[date][i].radioTitle = $rootScope.radio.mapSongs[date][i].radioTitle.split(' - ')[1];
					} else {
						$rootScope.radio.mapSongs[date][i].background = 'background-image: url(http://s2.vagalume.com/radio/image/'+$rootScope.radio.descr_url+'.jpg)';
					}
				};
				$rootScope.recentSongs = $rootScope.radio.mapSongs[date];
			}
		} else {
			$rootScope.recentSongs = false;
		}
	}
	,   resRadioInfo = function(data) {
		if (data) {
			// Verificar status do Player
			if (Player.status == 'playing') Player.stop();

			// Colocar streaming para tocar
			Player.setStreams(data.stream);
			Player.play();

			// Informação da rádio
			$rootScope.radio = data;
			$rootScope.player = Player;

			RadioModel.getRadioSonglist($rootScope.radio.id, function(data) {
				$rootScope.radio.mapSongs = data;
				buildRecentSongs();
			});

			// Montar músicas/artistas recentes
			buildRecentSongs();
			$scope.changeRankFilter($scope.rankType);
		} else {
			window.plugins.toast.showShortBottom('Problema para obter informação da rádio');
			$timeout(function(){initPlayer()}, 5000);
		}
	}
	,   initPlayer = function() {
		// Inicializar o player
		Player.media && Player.destroy();
		// Pegar informação da rádio		
		$http.get('manifest.json')
		.success(function(data) {
			RadioModel.getRadioInfo(data.radioID, resRadioInfo);
		});
	}
	,   share = function() {
		var message = '';
		if ($rootScope.radio.currentSong.song) {
			message = '#Escutando ' + $rootScope.radio.currentSong.song + ' - ' + $rootScope.radio.currentSong.band + ' na ' + $rootScope.radio.name + ' 📻';
		} else {
			message = '#Escutando ' + $rootScope.radio.name + ' 📻';
		}
		window.plugins.socialsharing.share(message, null, null, 'http://www.vagalume.com.br/radio/'+$rootScope.radio.descr_url+'/');
	}
	,   changeSlide = function(index) {
		$scope.currentTab = index;
		$ionicSlideBoxDelegate.slide(index);
		$timeout(function(){},10);
		if(index == 2) {
			$scope.changeRankFilter($scope.rankType);
		}
	}
	,   changeRankFilter = function(type) {
		if (type == 'songs') {
			$rootScope.rankRadio = $rootScope.radio.songRank.length ? $rootScope.radio.songRank : false;
		} else {
			$rootScope.rankRadio = $rootScope.radio.bandRank.length ? $rootScope.radio.bandRank : false;
		}
	}
	,   openLyrics = function(song) {
		var scheme;

		if(device.platform === 'iOS') {
            scheme = 'ios.vagalume://';
		}
		else if(ionic.Platform.isAndroid()) {
			scheme = 'br.com.vagalume.android';
		}

		if (song.title) {
			var bandURL = song.url.match(/^\/([^\/]+)\/([^\/\.]+)/)[1]
			,   songURL = song.url.match(/^\/([^\/]+)\/([^\/\.]+)/)[2];

            if (ionic.Platform.isAndroid()) {
                var url = 'vagalume://lyrics/'+bandURL+'/'+songURL+'/'+song.id+'#Intent;scheme=vagalume;package=br.com.vagalume.android;S.browser_fallback_url=http%3A%2F%2Fm.vagalume.com.br%2F'+bandURL+'%2F'+songURL+'.html;launchFlags=0x8080000;end';
            } else {
                var url = scheme + 'www.vagalume.com.br/' + bandURL+'/'+songURL+'.html';
            }

			appAvailability.check(
				scheme,
				function() {
					window.open(url, '_system', 'location=no');
				},
				function() {
					window.open('http://m.vagalume.com.br/'+bandURL+'/'+songURL+'.html', '_system', 'location=no');
				}
			);
		} else if (song.band.descr_url) {
            if (ionic.Platform.isAndroid()) {
                var url = 'vagalume://lyrics/'+song.band.descr_url+'/'+song.descr_url+'/'+song.id+'#Intent;scheme=vagalume;package=br.com.vagalume.android;S.browser_fallback_url=http%3A%2F%2Fm.vagalume.com.br%2F'+song.band.descr_url+'%2F'+song.descr_url+'.html;launchFlags=0x8080000;end';
            } else {
                var url = scheme + 'www.vagalume.com.br/' + song.band.descr_url+'/'+song.descr_url+'.html';
            }

			appAvailability.check(
				scheme,
				function() {
					window.open(url, '_system', 'location=no');
				},
				function() {
					window.open('http://m.vagalume.com.br/'+song.band.descr_url+'/'+song.descr_url+'.html', '_system', 'location=no');
				}
			);
		}
	}

	// Limpar eventos
	ControlEvents.clear();

	ControlEvents.setPlaying($rootScope.$on('player.playing', function() {
		$rootScope.radio.status = 'playing';
		ButtonModel.setPlaying();
		$scope.$apply();
	}));
	ControlEvents.setPause($rootScope.$on('player.pause', function() {
		$rootScope.radio.status = 'paused';
		ButtonModel.setPause();
		$scope.$apply();
	}));
	ControlEvents.setBuffering($rootScope.$on('player.buffering', function() {
		$rootScope.radio.status = 'buffering';
		ButtonModel.setBuffering();
		$scope.$apply();
	}));
	ControlEvents.setErrorEvent($rootScope.$on('player.error', function(error, type) {
		$rootScope.radio.status = 'none';
		RadioModel.sendErrorLog($rootScope.radio.id);

		ButtonModel.setError();
		$scope.$apply();
	}));

	// Funções do DOM
	$scope.slideHasChanged = slideHasChanged;
	$scope.changeRankFilter = changeRankFilter;
	$scope.changeSlide = changeSlide;
	$scope.share = share;
	$scope.openLyrics = openLyrics;

	// Inicializar variavel
	$scope.currentTab = 0;
	$scope.rankType = 'songs';
	$rootScope.player = false;

	// Inicializar o player
	// Timeout pra dar tempo de carregar o accplayer
	$timeout(function() {initPlayer()}, 1000);
})

// Factory
.factory('Player', function($rootScope, $timeout, $interval, RadioModel) {
	// Instancia do player
	var player = {
		status: 'none',
		canPlay: false,
		media: null,
		isAAC: false,
		streamings: []
	}
	,   current           = 0
	,   errorTimeout      = false
	,   connectionTimeout = false
	,   currentInterval   = false
	,   statusEvents      = {
		none: function() {
			player.status = 'none';
		},
		buffering: function() {
			player.status = 'buffering';
			$rootScope.$emit('player.buffering');
		},
		playing: function() {
			$timeout.cancel(errorTimeout);
			$timeout.cancel(connectionTimeout);
			if (!currentInterval) {
				getCurrentSong();
				currentInterval = $interval(function() {
					getCurrentSong();
				}, 15000);
			}
			player.status = 'playing';
			player.canPlay = true;
			$rootScope.$emit('player.playing');
			MusicControls.updateIsPlaying(true);
		},
		paused: function() {
			player.status = 'paused';
			$rootScope.$emit('player.pause');
			MusicControls.updateIsPlaying(false);
		},
		stopped: function() {
			if (player.forceStop === 1) {
				$rootScope.$emit('player.pause');
				player.status = 'paused';
				MusicControls.updateIsPlaying(false);
			} else {
				$rootScope.$emit('player.stop');
				player.status = 'stopped';
			}

			if (!player.forceStop) {
				player.forceStop = false;
				connectionTimeout = $timeout(function() {
					player.status = 'buffering';
					$rootScope.$emit('player.buffering');
					window.plugins.toast.showShortBottom('Reconectando...');
					connectionCallback();
				}, 5000);
			};
		},
		unknown: function() {
			player.status = 'unknown';
		}
	};

	function AACPlayer(streaming) {
		this.streaming = streaming;
		this.statusCallback = function(statusCallback) {
			aacplayer.statusCallback(statusCallback);
		};
		this.play = function() {
			player.status == 'none' || player.status == 'stopped' ? aacplayer.setStream(this.streaming) : aacplayer.play();
		};
		this.stop = function() {
			player.forceStop = true;
			aacplayer.stop();
		};
		this.release = function() {
			aacplayer.destroy();
		};
		this.pause = function() {
			player.forceStop = 1;
			aacplayer.stop();
		};
	};

	function iOSPlayer(streaming) {
		this.player = new Audio(streaming);
		ionic.Platform.isAndroid() ? statusEvents.buffering() : false;
		this.statusCallback = function() {
			this.player.onloadstart = statusEvents.buffering;
			this.player.onplaying   = statusEvents.playing;
			this.player.onpause     = statusEvents.paused;
		};
		this.play = function() {
			this.player.play();
		};
		this.stop = function() {
			this.player.pause();
		};
		this.release = function() {
			this.player.pause();
			this.player.src = "";
			this.player = null;
		};
		this.pause = function() {
			this.player.pause();
		};
	};

	function getCurrentSong() {
		RadioModel.getCurrentSong($rootScope.radio.descr_url, function(data) {
			var radioURL = $rootScope.radio.descr_url;
			if (data) {
				$rootScope.radio.currentSong = data;

				var last = $rootScope.recentSongs[0];
				if (!last || last.id != data.id) {
					var item = {
						radioTitle: data.title,
						id: data.id,
						bandID: data.bandID,
						hour: data.hour,
						url: data.url,
						band: data.band,
						title: data.song
					};

					if (data.url) {
						var bandURL = data.url.match(/^\/([^\/]+)\//)[1];
						item.background = 'background-image: url(http://s2.vagalume.com/'+bandURL+'/images/'+bandURL+'.jpg)';
					} else {
						item.background = 'background-image: url(http://s2.vagalume.com/radio/image/'+$rootScope.radio.descr_url+'.jpg)';
					}

					if (!$rootScope.recentSongs) {
						$rootScope.recentSongs = [];
					}

					$rootScope.recentSongs.unshift(item);
				}

				if (data.url) {
					$rootScope.radio.currentSong.bandURL = data.url.match(/^\/([^\/]+)\//)[1];
				} else {
					$rootScope.radio.currentSong.noSong = true;
				}
			} else {
				$rootScope.radio.currentSong = {
					noSong: true
				};
			}

			// Notificação de background
			var config = {};
			if ($rootScope.radio.currentSong && $rootScope.radio.currentSong.song) {
				config = {
					track     : $rootScope.radio.currentSong.song,
					artist    : $rootScope.radio.currentSong.band,
					subText   : $rootScope.radio.name,
					cover     : 'http://s2.vagalume.com/radio/image/'+$rootScope.radio.descr_url+'.jpg',
					isPlaying : $rootScope.radio.status == 'playing',
					isFavorite: $rootScope.isFavorite,
					ticker    : $rootScope.radio.currentSong.song + ' - ' + $rootScope.radio.currentSong.band
				}
			} else {
				config = {
					track     : 'Você está ouvindo',
					artist    : $rootScope.radio.name,
					cover     : 'http://s2.vagalume.com/radio/image/'+$rootScope.radio.descr_url+'.jpg',
					isPlaying : $rootScope.radio.status == 'playing',
					isFavorite: $rootScope.isFavorite,
					ticker    : 'Você está ouvindo ' + $rootScope.radio.name
				}
			};

			if ($rootScope.radio.status == 'playing') {
				MusicControls.create(config);
			};
		});
	};

	function errorCallback(error) {
		player.media && player.destroy();
		if (player.canPlay) {
			connectionTimeout = $timeout(function() {
				player.status = 'buffering';
				$rootScope.$emit('player.buffering');
				window.plugins.toast.showShortBottom('Reconectando...');
				connectionCallback();
			}, 5000);
		} else {
			if (player.streamings[current].url.match(/;?icy=http/)) {
				player.streamings[current].url = player.streamings[current].url.replace(';?icy=http', '');
				if (player.streamings.length > (current + 1)) {
					current++;
					player.tryStream({
						autoplay: true
					});
				} else {
					current = 0;
					player.status = 'none';
					switch(error.code) {
						case 0:
							$rootScope.$emit('player.error', 'stream_error');
							break;
						case 11:
							$rootScope.$emit('player.error', 'stream_timeout');
							break;
						default:
							$rootScope.$emit('player.error', 'stream_error');
							break;
					};

					window.plugins.toast.showShortBottom('Erro ao tocar a rádio, tente novamente mais tarde');
				}
			} else if (player.streamings[current].url.match(/;stream.mp3/)) {
				player.streamings[current].url = player.streamings[current].url.replace(';stream.mp3', '');
				player.streamings[current].url += ';?icy=http';
				player.tryStream({
					autoplay: true
				});
			} else {
				var lastChar = player.streamings[current].url.substr(-1);
				if (lastChar != '/') {
					player.streamings[current].url = player.streamings[current].url + '/';
				}
				player.streamings[current].url += ';stream.mp3';
				player.tryStream({
					autoplay: true
				});
			}
		};
	};

	function connectionCallback() {
		player.tryStream({
			autoplay: true
		});
	};

	// Trata as informações de status do player
	function statusCallback(status) {
		switch(status) {
			case 0:
				statusEvents.none();
				break;
			case 1:
				statusEvents.buffering();
				break;
			case 2:
				statusEvents.playing();
				break;
			case 3:
				statusEvents.paused();
				break;
			case 4:
				statusEvents.stopped();
				break;
			default:
				statusEvents.unknown();
				break;
		}
	};

	player.tryStream = function(params) {
		player.streamings[current].type == 'aac' && ionic.Platform.isAndroid() ? isAAC = true : isAAC = false;
		player.media && player.destroy();
		if (ionic.Platform.isIOS()) {
			player.media = new iOSPlayer(player.streamings[current].url)
		} else {
			player.media = isAAC ? new AACPlayer(player.streamings[current].url) : new Media(player.streamings[current].url);
		}

		if (isAAC) {
			player.media.statusCallback(statusCallback);
		} else if (ionic.Platform.isAndroid()) {
			player.media.statusCallback = statusCallback;
		} else {
			player.media.statusCallback();
		}

		errorTimeout = $timeout(function() {
			errorCallback({code: 11});
		}, 10000);

		if (params && params.autoplay) {
			player.play();
		}
	};

	player.setStreams = function(streamings) {
		current = 0;
		currentInterval = false;
		$interval.cancel(currentInterval);
		$timeout.cancel(errorTimeout);
		streamings = player.sortStreamings(streamings);
		player.streamings = streamings;
		player.canPlay = false;
		if (streamings.length) {
			player.tryStream();
		} else {
			window.plugins.toast.showShortBottom('Rádio indisponível');
			$rootScope.$emit('player.error', 'no_streamings');
		}
	};

	player.play = function() {
		player.media && player.media.play();
	};

	player.pause = function() {
		if (player.media) {
			if (isAAC) {
				player.media.pause();
			} else {
				player.forceStop = 1;
				player.media.stop();
				player.media.release();
			}
		} else {
			player.stop();
		}
	};

	player.stop = function() {
		if (player.media) {
			player.forceStop = true;
			player.media.stop();
		}
	};

	var toggleTimeout = null;
	player.toggle = function() {
		$timeout.cancel(toggleTimeout);
		toggleTimeout = $timeout(function() {
			var DF = window.plugins.deviceFeedback
			DF.haptic(DF.KEYBOARD_TAP);
			if (player.status == 'playing') {
				player.pause();
			} else if (player.status = 'none') {
				player.tryStream({
					autoplay: true
				});
			} else {
				player.play();
			}
		}, 150);
	};

	player.sortStreamings = function(streamings) {
		if (streamings) {
			streamings.sort(function(a,b) {
				if (a.type < b.type)
					return -1;
				if (a.type > b.type)
					return 1;
				return 0;
			});
		}
		return streamings;
	}

	player.destroy = function() {
		if (player.media) {
			player.forceStop = true;
			player.media.stop();
			player.media.release();
			player.media = null;
		};
	}

	return player;
})

.factory('RadioModel', function($http, $rootScope, RadioURL) {
	var RadioModel = {};

	// Pega as informações da rádio e URL de streamings
	RadioModel.getRadioInfo = function(radioID, cb) {
		$http.get('http://www.vagalume.com.br/json/radio/'+radioID+'.json')
		.success(function(data) {
			if (data.id) {
				RadioURL = data.descr_url;
				cb && cb(data);
			} else {
				cb && cb(false);
			}
		})
		.error(function(e) {
			cb && cb(false);
		});
	};

	RadioModel.getRadioSonglist = function(radioID, cb) {
		$http.get('http://app2.vagalume.com.br/radio/api.php?action=songlist&radioID='+radioID)
		.success(function(data) {
			if (data) {
				cb && cb(data);
			} else {
				cb && cb(false);
			}
		})
		.error(function(e) {
			cb && cb(false);
		});		
	}

	RadioModel.sendErrorLog = function(radioID) {
		$http.get('http://app.vagalume.com.br/service/fm/player-error?id='+radioID);
	};

	// Retorna a música que está tocando no momento de uma determinada rádio
	RadioModel.getCurrentSong = function(radioURL, cb) {
		$http.get('http://app2.vagalume.com.br/radio/api.php?action=getCurrentSong&radioURL='+radioURL)
		.success(function(data) {
			if (data.title) {
				cb && cb(data);
			} else {
				cb && cb(false);
			}
		})
		.error(function(e) {
			cb && cb(false);
		})
	};

	// Pega as últimas rádios que tocaram determinado artista
	RadioModel.getArtistRadios = function(bandID, cb) {
		$http.get('http://app.vagalume.com.br/service/fm/get-last-radios?bandID='+bandID)
		.success(function(response) {
			var pointerRadios = response.data
			,   band = '';
			if (response.status == 'success' && Object.keys(pointerRadios).length) {
				var radios = [];
				for (var pointer in pointerRadios) {
					if (pointerRadios[pointer].length) {
						for (var i = 0; i < pointerRadios[pointer].length; i++) {
							var radio  = pointerRadios[pointer][i]
							,   slug   = radio.songURL.match(/\/([^\/]+)/)[1]
							,   isInside = false;

							band = radio.bandName;

							radios.push({
								title: radio.radioName,
								now: radio.now,
								url: '/radio/'+radio.radioURL,
								song: radio.songName,
								id: radio.radioID
							});
						};
					}
				}
				radios.sort(function(a, b) {
					return new Date(b.now) - new Date(a.now);
				});
				cb && cb(radios.splice(0, 25), band);
			} else {
				cb && cb([]);
			}
		})
		.error(function(e) {
			cb && cb([]);
		});
	}

	return RadioModel;
})

.factory('ControlEvents', function() {
	var eventMap = {};
	return {
		setBuffering: function(event) { eventMap.setBuffering = event;},
		setPlaying: function(event) { eventMap.playing = event;},
		setPause: function(event) { eventMap.pause = event;},
		setChangeRegion: function(event) { eventMap.changeregion = event},
		setErrorEvent: function(event) { eventMap.errorevent = event},
		clear: function() {
			for(var name in eventMap) {
				eventMap[name]();
			};
		}
	}
})

.factory('ButtonModel', function() {
	var setPlaying = function() {
		var button = document.querySelectorAll('.play-pause');
		if (button.length) {
			button = angular.element(button);
			button.removeClass('ion-load-c ion-play ion-pause');
			button.addClass('ion-pause')
		}
	}

	var setPause = function() {
		var button = document.querySelectorAll('.play-pause');
		if (button.length) {
			button = angular.element(button);
			button.removeClass('ion-load-c ion-play ion-pause');
			button.addClass('ion-play')
		}
	}

	var setBuffering = function() {
		var button = document.querySelectorAll('.play-pause');
		if (button.length) {
			var button = angular.element(button);
			button.removeClass('ion-load-c ion-play ion-pause');
			button.addClass('ion-load-c')
		}
	}

	var setError = function() {
		var button = document.querySelectorAll('.play-pause');
		if (button.length) {
			button = angular.element(button);
			button.removeClass('ion-load-c ion-play ion-pause');
			button.addClass('ion-play')
			$rootScope.playerError = true;
		}
	}

	return {
		setPlaying: setPlaying,
		setPause: setPause,
		setBuffering: setBuffering,
		setError: setError
	}
})

// Filters
.filter('region', function() {
	return function(radio, paren) {
		var res = '';
		if (radio && radio.city) {
			res = radio.city+', '+(radio.region_code || radio.region);
		} else if (radio && radio.region) {
			res = radio.region;
		} else if (radio && radio.country) {
			res = radio.country;
		}
		return paren ? '('+res+')' : res;
	};
})

.filter('radioTime', function() {
	return function(time) {
		if (time) {
			return time.replace(':', 'h');
		}
	}
})

.filter('position', function() {
	return function(value) {
		return value < 10 ? '0'+value+'º' : value+'º';
	};
})
