// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('PartyVR', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    ionic.Platform.fullScreen();
    if (window.StatusBar) {
      return StatusBar.hide();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      })
      .state('video-wall', {
        url: '/video-wall',
        templateUrl: 'templates/video-wall.html',
        controller: 'VideoCtrl'
      });
    $urlRouterProvider.otherwise('/home');
})

.controller('VideoCtrl', function($scope) {
})

.controller('HomeCtrl', function($scope, $state) {
  $scope.goToProfile = function() {
    $state.go('video-wall');
  }
})

.directive('splashScreen', [function() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      create($element[0], $scope);
    }
  };

  function create(glFrame, $scope) {
    var scene,
      camera,
      renderer,
      element,
      container,
      effect,
      controls,
      clock;

      init();

    glFrame.addEventListener('click', function() {
      $scope.goToProfile();
    });

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
      camera.position.set(0, 15, 0);
      scene.add(camera);

      var geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

      var material = new THREE.MeshBasicMaterial( {
        map: new THREE.ImageUtils.loadTexture( 'img/splash-panorama.jpg' )
      } );

      mesh = new THREE.Mesh( geometry, material );

      scene.add( mesh );

      renderer = new THREE.WebGLRenderer();
      element = renderer.domElement;
      container = glFrame;
      container.appendChild(element);

      effect = new THREE.StereoEffect(renderer);

      // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
      controls = new THREE.OrbitControls(camera, element);
      controls.target.set(
        camera.position.x + 0.15,
        camera.position.y,
        camera.position.z
      );
      controls.noPan = true;
      controls.noZoom = true;

      // Our preferred controls via DeviceOrientation
      function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        window.removeEventListener('deviceorientation', setOrientationControls, true);
      }
      window.addEventListener('deviceorientation', setOrientationControls, true);

      clock = new THREE.Clock();

      animate();
    }

    function animate() {
      var elapsedSeconds = clock.getElapsedTime();

      requestAnimationFrame(animate);

      update(clock.getDelta());
      render(clock.getDelta());
    }

    function resize() {
      var width = container.offsetWidth;
      var height = container.offsetHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      effect.setSize(width, height);
    }

    function update(dt) {
      resize();

      camera.updateProjectionMatrix();

      controls.update(dt);
    }

    function render(dt) {
      effect.render(scene, camera);
    }
  }
}])

.directive('videoWall', [function() {

  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      create($element[0]);
    }
  }

  function create(glFrame) {

    // MAIN

    // standard global variables
    var container, scene, camera, renderer, controls, stats;

    // custom global variables
    var video, videoImage, videoImageContext, videoTexture, movieScreen;
    var video2, videoImage2, videoImageContext2, videoTexture2, movieScreen2;
    var video3, videoImage3, videoImageContext3, videoTexture3, movieScreen3;

    var raycasterPointer;

    var scene,
      camera,
      renderer,
      element,
      container,
      effect,
      controls,
      clock;

    init();
    animate();

    // FUNCTIONS
    function init()
    {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
      camera.position.set(0, 15, 0);
      scene.add(camera);
  		renderer = new THREE.WebGLRenderer();
      element = renderer.domElement;
      container = glFrame;
      container.appendChild(element);

      effect = new THREE.StereoEffect(renderer);

      // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
      controls = new THREE.OrbitControls(camera, element);
      controls.target.set(
        camera.position.x + 0.15,
        camera.position.y,
        camera.position.z
      );
      controls.noPan = true;
      controls.noZoom = true;
    	// LIGHT
    	var light = new THREE.PointLight(0xffffff);
    	light.position.set(0,250,0);
    	scene.add(light);
    	// FLOOR
    	var floorTexture = new THREE.ImageUtils.loadTexture( 'img/checkerboard.jpg' );
    	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    	floorTexture.repeat.set( 10, 10 );
    	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    	floor.position.y = -0.5;
    	floor.rotation.x = Math.PI / 2;
    	scene.add(floor);
    	// SKYBOX/FOG
    	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    	// scene.add(skyBox);
    	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );


    	///////////
    	// VIDEO //
    	///////////

    	// create the video element
    	video = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video.src = "videos/afrojack-1.mp4";
    	video.load(); // must call after setting/changing source
    	// video.play();

    	// alternative method --
    	// create DIV in HTML:
    	// <video id="myVideo" autoplay style="display:none">
    	//		<source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
    	// </video>
    	// and set JS variable:
    	// video = document.getElementById( 'myVideo' );

    	videoImage = document.createElement( 'canvas' );
    	videoImage.width = 360;
    	videoImage.height = 360;

    	videoImageContext = videoImage.getContext( '2d' );
    	// background color if no video present
    	videoImageContext.fillStyle = '#000000';
    	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

    	videoTexture = new THREE.Texture( videoImage );
    	videoTexture.minFilter = THREE.LinearFilter;
    	videoTexture.magFilter = THREE.LinearFilter;

    	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    	// the geometry on which the movie will be displayed;
    	// 		movie image will be scaled to fit these dimensions.
    	var movieGeometry = new THREE.PlaneGeometry( 360, 360, 4, 4 );
    	movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    	movieScreen.position.set(-60,180,0);
    	scene.add(movieScreen);

      // create the video element
    	video2 = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video2.src = "videos/afrojack-2.mp4";
    	video2.load(); // must call after setting/changing source
    	// video2.play();

    	// alternative method --
    	// create DIV in HTML:
    	// <video id="myVideo" autoplay style="display:none">
    	//		<source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
    	// </video>
    	// and set JS variable:
    	// video = document.getElementById( 'myVideo' );

    	videoImage2 = document.createElement( 'canvas' );
    	videoImage2.width = 360;
    	videoImage2.height = 360;

    	videoImageContext2 = videoImage2.getContext( '2d' );
    	// background color if no video present
    	videoImageContext2.fillStyle = '#000000';
    	videoImageContext2.fillRect( 0, 0, videoImage2.width, videoImage2.height );

    	videoTexture2 = new THREE.Texture( videoImage2 );
    	videoTexture2.minFilter = THREE.LinearFilter;
    	videoTexture2.magFilter = THREE.LinearFilter;

    	var movieMaterial2 = new THREE.MeshBasicMaterial( { map: videoTexture2, overdraw: true, side:THREE.DoubleSide } );
    	// the geometry on which the movie will be displayed;
    	// 		movie image will be scaled to fit these dimensions.
    	var movieGeometry2 = new THREE.PlaneGeometry( 360, 360, 4, 4 );
    	movieScreen2 = new THREE.Mesh( movieGeometry2, movieMaterial2 );
    	movieScreen2.position.set(360,180,150);
      movieScreen2.rotateY(30);
    	scene.add(movieScreen2);

      // create the video element
    	video3 = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video3.src = "videos/afrojack-3.mp4";
    	video3.load(); // must call after setting/changing source
    	// video3.play();

    	// alternative method --
    	// create DIV in HTML:
    	// <video id="myVideo" autoplay style="display:none">
    	//		<source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
    	// </video>
    	// and set JS variable:
    	// video = document.getElementById( 'myVideo' );

    	videoImage3 = document.createElement( 'canvas' );
    	videoImage3.width = 360;
    	videoImage3.height = 360;

    	videoImageContext3 = videoImage3.getContext( '2d' );
    	// background color if no video present
    	videoImageContext3.fillStyle = '#000000';
    	videoImageContext3.fillRect( 0, 0, videoImage3.width, videoImage3.height );

    	videoTexture3 = new THREE.Texture( videoImage3 );
    	videoTexture3.minFilter = THREE.LinearFilter;
    	videoTexture3.magFilter = THREE.LinearFilter;

    	var movieMaterial3 = new THREE.MeshBasicMaterial( { map: videoTexture3, overdraw: true, side:THREE.DoubleSide } );
    	// the geometry on which the movie will be displayed;
    	// 		movie image will be scaled to fit these dimensions.
    	var movieGeometry3 = new THREE.PlaneGeometry( 360, 360, 4, 4 );
    	movieScreen3 = new THREE.Mesh( movieGeometry3, movieMaterial3 );
    	movieScreen3.position.set(-360,180,150);
      movieScreen3.rotateY(-30);
    	scene.add(movieScreen3);

      var focus = new THREE.PointLight(0x00ccff, 1, 20);
      focus.position.set(0, 0, -10);
      camera.add(focus);
      raycasterPointer = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}));
      scene.add(raycasterPointer);

    	camera.position.set(0,200,200);
      // Our preferred controls via DeviceOrientation
      function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        window.removeEventListener('deviceorientation', setOrientationControls, true);
      }
      window.addEventListener('deviceorientation', setOrientationControls, true);
    }

    function animate()
    {
      requestAnimationFrame( animate );
    	render();
    	update();
    }

    function update()
    {
      var width = container.offsetWidth;
      var height = container.offsetHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      // effect.setSize(width, height);
    	controls.update();
    }

    function render()
    {
    	if ( video.readyState === video.HAVE_ENOUGH_DATA )
    	{
    		videoImageContext.drawImage( video, 0, 0 );
    		if ( videoTexture )
    			videoTexture.needsUpdate = true;
    	}

      if ( video2.readyState === video2.HAVE_ENOUGH_DATA )
    	{
    		videoImageContext2.drawImage( video2, 0, 0 );
    		if ( videoTexture2 )
    			videoTexture2.needsUpdate = true;
    	}

      if ( video3.readyState === video3.HAVE_ENOUGH_DATA )
    	{
    		videoImageContext3.drawImage( video3, 0, 0 );
    		if ( videoTexture3 )
    			videoTexture3.needsUpdate = true;
    	}

      var cameraDirection = camera.getWorldDirection();
      raycasterPointer.position.set(camera.position.x + (cameraDirection.x * 17), camera.position.y + (cameraDirection.y * 17), camera.position.z + (cameraDirection.z * 17));

      if (distance(movieScreen.position, raycasterPointer.position) < 200) {
        video.play();
      } else {
        video.pause();
      }

      if (distance(movieScreen2.position, raycasterPointer.position) < 350) {
        video2.play();
      } else {
        video2.pause();
      }

      if (distance(movieScreen3.position, raycasterPointer.position) < 350) {
        video3.play();
      } else {
        video3.pause();
      }

    	renderer.render( scene, camera );
    }

    function distance(a, b) {
      deltaX = b.x - a.x;
      deltaY = b.y - a.y;
      deltaZ = b.z - a.z;
      var d = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      return d;
    }
  }
}]);
