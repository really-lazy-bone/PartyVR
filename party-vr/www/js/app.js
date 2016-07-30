angular.module('PartyVR', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
        url: '/video-wall/:dj',
        templateUrl: 'templates/video-wall.html',
        controller: 'VideoCtrl'
      });
    $urlRouterProvider.otherwise('/home');
})

.controller('VideoCtrl', function($scope, $timeout, $state, $stateParams) {
  $scope.currentItemIndex = 0;
  $scope.doubleClicked = false;
  $scope.dj = $stateParams.dj;

  document.querySelector('video-wall')
    .addEventListener('click', function() {
      $timeout(function() {
        if (!$scope.doubleClicked) {
          $scope.currentItemIndex ++;
          if ($scope.currentItemIndex === 3) {
            $scope.currentItemIndex = 0;
          }
        }
      }, 300);
    }, false);
  document.querySelector('video-wall')
    .addEventListener('dblclick', function() {
      $scope.doubleClicked = true;
      if ($scope.currentItemIndex === 0) {
        // display success checkmark
        $scope.hideMenu = true;
        $scope.showSuccess = true;
        $timeout(function() {
          $scope.hideMenu = false;
          $scope.showSuccess = false;
        }, 2000);
      } else if ($scope.currentItemIndex === 1) {
        // go to next person
        var newDj = ($scope.dj === 'afrojack') ? 'martin-garrix' : 'afrojack';
        $state.go('video-wall', {dj: newDj});
      } else  if ($scope.currentItemIndex === 2) {
        // go to webrtc call screen
      }
      $timeout(function() {
        $scope.doubleClicked = false;
      }, 500);
    }, false);
})

.controller('HomeCtrl', function($scope, $state) {
  $scope.goToProfile = function() {
    $state.go('video-wall', {dj: 'afrojack'});
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
    scope: {
      person: '='
    },
    link: function($scope, $element, $attr) {
      create($element[0], $scope);
    }
  }

  function create(glFrame, $scope) {
    // MAIN

    // standard global variables
    var container, scene, camera, renderer, controls;

    // custom global variables
    var video, videoImage, videoImageContext, videoTexture, movieScreen;
    var video2, videoImage2, videoImageContext2, videoTexture2, movieScreen2;
    var video3, videoImage3, videoImageContext3, videoTexture3, movieScreen3;

    // custom global variables
    var ball;
    var ballSpeed = 0.06; //default ball speed
    var lightSpeed = 0.5;

    //array of lights
    var spotlights = [];
    var lightTargets = [];
    var lightColors = [];
    var lightAmount = 30;

    //create an array of floor and wall spotlights:
    for (var i=0; i<lightAmount ;i++){

    	lightColors[i] = getRandomColor();
    	//for floor
    	spotlights[i] = new THREE.SpotLight(lightColors[i]);
    	spotlights[i].position.set(0,500,200);
    	spotlights[i].shadowCameraVisible = true;
    	spotlights[i].intensity = 3;
    	spotlights[i].castShadow = true;
    	spotlights[i].angle = Math.PI/30;
    	lightTargets[i] = new THREE.Object3D();

    }

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
      camera.position.set(0, 180, 0);
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
      var directionalLight1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    	directionalLight1.position.set( 1, 0, 0 );
    	scene.add( directionalLight1 );
    	var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.2 );
    	directionalLight2.position.set( 0, 1, 0 );
    	scene.add( directionalLight2 );
    	var directionalLight3 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    	directionalLight3.position.set( 0, 0, 1 );
    	scene.add( directionalLight3 );
    	var directionalLight4 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    	directionalLight4.position.set( -1, 0, 0 );
    	scene.add( directionalLight4 );
    	var directionalLight5 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    	directionalLight5.position.set( 0, 0, -1 );
    	scene.add( directionalLight5 );
    	// FLOOR
    	var floorTexture = new THREE.ImageUtils.loadTexture( 'img/checkerboard.jpg' );
    	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    	floorTexture.repeat.set( 10, 10 );
    	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    	var floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 10, 10);
    	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    	floor.position.y = -0.5;
    	floor.rotation.x = Math.PI / 2;
      floor.receiveShadow = true;

    	scene.add(floor);
    	// SKYBOX/FOG
      // BOX container MATERIAL
    	var cubeMaterialArray = [];
    	// order to add materials: x+,x-,y+,y-,z+,z-
    	var wallTexture = new THREE.ImageUtils.loadTexture( 'img/dark-space-texture.jpg' );
    	// floor: mesh to receive shadows
    	cubeMaterialArray.push(new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }));
    	cubeMaterialArray.push(new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }));
    	cubeMaterialArray.push(new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.DoubleSide }));

    	cubeMaterialArray.push(new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }));
    	cubeMaterialArray.push(new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }));
    	cubeMaterialArray.push(new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }));
    	var skyBoxMaterial = new THREE.MeshFaceMaterial(cubeMaterialArray);

    	var skyBoxGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
    	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    	scene.add(skyBox);
    	scene.fog = new THREE.FogExp2( 0x9999ff, 0 );

      // ball
    	var ballContainer = new THREE.Object3D();
    	var radius = 100;
    	var distance = 500;
    	var colors = [];

    	var sphereGeometry = new THREE.SphereGeometry( radius, 32, 32);
    	var texture = new THREE.ImageUtils.loadTexture('img/discoBallTexture.jpg');

      var sphereMaterial = new THREE.MeshBasicMaterial( {map: texture} );
    	ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
    	ball.position.set(0, distance, 200);

    	ballContainer.add(ball);
    	scene.add(ballContainer);

      //======================================================//
      //position the array of lights onto the scene
      for (var i=0; i<lightAmount ;i++){
      	scene.add(spotlights[i]);

      	lightTargets[i].position.x=Math.random()*500-100;
      	lightTargets[i].position.y=200;
      	lightTargets[i].position.z=Math.random()*300-100;

      	scene.add(lightTargets[i]);

        console.log(lightTargets[i].position);

      	spotlights[i].target = lightTargets[i];
      }


    	///////////
    	// VIDEO //
    	///////////

    	// create the video element
    	video = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video.src = "videos/" + $scope.person + "-1.mp4";
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
    	var movieGeometry = new THREE.PlaneBufferGeometry( 360, 360, 4, 4 );
    	movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    	movieScreen.position.set(-60,180,0);
    	scene.add(movieScreen);

      // create the video element
    	video2 = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video2.src = "videos/" + $scope.person + "-2.mp4";
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
    	var movieGeometry2 = new THREE.PlaneBufferGeometry( 360, 360, 4, 4 );
    	movieScreen2 = new THREE.Mesh( movieGeometry2, movieMaterial2 );
    	movieScreen2.position.set(360,180,150);
      movieScreen2.rotateY(30);
    	scene.add(movieScreen2);

      // create the video element
    	video3 = document.createElement( 'video' );
    	// video.id = 'video';
    	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    	video3.src = "videos/" + $scope.person + "-3.mp4";
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
    	var movieGeometry3 = new THREE.PlaneBufferGeometry( 360, 360, 4, 4 );
    	movieScreen3 = new THREE.Mesh( movieGeometry3, movieMaterial3 );
    	movieScreen3.position.set(-360,180,150);
      movieScreen3.rotateY(-30);
    	scene.add(movieScreen3);

      //Artist name
      var artistName = $scope.person;
      var currentArtistText = new THREE.TextGeometry(artistName, {
        size: 40,
        height: 1
      });
      var currentArtistTextMesh = new THREE.Mesh(currentArtistText, new THREE.MeshBasicMaterial({
        color: 0xffffff, opacity: 1
      }))

      currentArtistTextMesh.position.y = 360;
      currentArtistTextMesh.position.z = 30;
      currentArtistTextMesh.position.x = -120;
      currentArtistTextMesh.rotation.x = -100;
      currentArtistTextMesh.rotation.y = -270;

      scene.add(currentArtistTextMesh);

      var artistProfilePicMap = {
        "afrojack":"img/afrojack-info-card.png",
        "martin-garrix":"img/martin-garrix-info-card.png",
        "kaskade":"img/kaskade-info-card.png"
      }

      var artistProfileTexture = THREE.ImageUtils.loadTexture(artistProfilePicMap[artistName]);
      artistProfileTexture.flipX = true;
      var artistProfileImg = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
         map:artistProfileTexture, side:THREE.DoubleSide
      });
     artistProfileImg.map.needsUpdate = true; //ADDED

     // plane
     var artistProfilePlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(360, 360, 4, 4),artistProfileImg);
     artistProfilePlane.position.set(-50,180,400);
     artistProfilePlane.overdraw = true;
     scene.add(artistProfilePlane);


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
      effect.setSize(width, height);
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

      // PARTY ON
      ball.rotation.y += ballSpeed;
      for(var i=0;i<lightAmount;i++){

    		if(lightTargets[i].position.x < 200&&lightTargets[i].position.z < 200){

    			lightTargets[i].position.x=lightTargets[i].position.x+(Math.random()*200-100)*lightSpeed;
    			lightTargets[i].position.z=lightTargets[i].position.z+(Math.random()*200-100)*lightSpeed;
    		}
    		else {
    			lightTargets[i].position.x=Math.random()*500-100;
    			lightTargets[i].position.z=Math.random()*200-100;
    		}
    	}

    	effect.render( scene, camera );
    }

    function distance(a, b) {
      deltaX = b.x - a.x;
      deltaY = b.y - a.y;
      deltaZ = b.z - a.z;
      var d = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      return d;
    }
  }

  function getRandomColor() {
  	var letters = '0123456789ABCDEF'.split('');
  	var color = '#';
  	for (var i = 0; i < 6; i++ ) {
  		color += letters[Math.round(Math.random() * 15)];
  	}
  	return color;
  }
}]);
