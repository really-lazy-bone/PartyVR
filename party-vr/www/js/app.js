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

.controller('VideoCtrl', function() {

})

.controller('HomeCtrl', function() {

})

.directive('splashScreen', [function() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      create($element[0]);
    }
  };

  function create(glFrame) {
    var scene,
      camera,
      renderer,
      element,
      container,
      effect,
      controls,
      clock;

      init();

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
    init();

    function init() {
      // Carousel
      // =====================================================
      //
      var double = 2;

      function Carousel(videos) {
          // Initialize and configure the carousel
          this.videoDimensions = {
              width: 1024,
              height: 1024
          };
          this.sphereDepth = 6000;
          this.sphereSegments = {
              width: 3,
              height: 1
          };
          this.sphereFaces = this.sphereSegments.width * this.sphereSegments.height;
          this.initialCameraPosition = 1500;

          // Set up the scene
          this.renderer = this.initRenderer();
          var element = this.renderer.domElement;
          element.addEventListener('click', like, false);
          element.addEventListener('dblclick', dislike, false);

          this.scene = this.initScene();
          this.camera = this.initCamera(this.sphereDepth, this.initialCameraPosition);

          this.clock = new THREE.Clock();

          // // Set up videos and panes
          this.videoPanes = this.initVideoPanes(videos, this.videoDimensions, this.sphereSegments);
          this.materials = this.initMaterials(this.videoPanes, this.sphereFaces);

          // // Create the sphere
          this.sphere = this.initSphereMesh(this.sphereDepth, this.sphereSegments, this.materials);
      }

      Carousel.prototype.initRenderer = function() {
          // Set up the WebGL renderer
          var renderer = new THREE.WebGLRenderer();
          renderer.setSize(window.innerWidth, window.innerHeight);
          return renderer;
      };

      Carousel.prototype.initScene = function() {
          // Create the scene
          return new THREE.Scene();
      };

      Carousel.prototype.initCamera = function(depth, position) {
          // Set up the camera
          var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, depth);
          camera.position.z = position;
          return camera;
      };

      Carousel.prototype.initMaterials = function(videoPanes, faces) {
          // Load all of the video pane materials to apply to the sphere mesh
          var materials = [];
          for (i=0; i < videoPanes.length; i++) {
              materials.push(videoPanes[i].material);
          }
          return materials;
      };

      Carousel.prototype.initSphereMesh = function(sphereDepth, sphereSegments, materials) {
          // Create the spherical mesh
          var geometry = new THREE.SphereGeometry(sphereDepth/2, sphereSegments.width, sphereSegments.height, 0, 3, 1, 1.2);
          for (var i=0; i < geometry.faces.length; i++) {
              geometry.faces[i].materialIndex = i % materials.length;
          }
          var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
          return mesh;
      };

      Carousel.prototype.initVideoPanes = function(videos, dimensions, segments) {
          // Create video panes with calculated positions for the list of videos
          var videoPanes = [];

          for (var i=0; i < videos.length; i++) {
              var video = videos[i];
              var videoPane = new VideoPane(
                  video,
                  dimensions,
                  segments
              );
              videoPanes.push(videoPane);
          }

          return videoPanes;
      };

      Carousel.prototype.setupScene = function() {
          // Set up the initial scene and add it to the dom
          this.sphere.position.z = this.sphereDepth/2;
          this.scene.add(this.sphere);
          glFrame.appendChild(this.renderer.domElement);
      };

      Carousel.prototype.animate = function() {
          // Animate a frame of the carousel
          var obj = this;
          requestAnimationFrame(function() {
              return obj.animate();
          });
          var effect = new THREE.StereoEffect(this.renderer);
          resize(this.camera, this.renderer, effect);

          // Check each video for updates
          for (var i=0; i < obj.videoPanes.length; i++) {
              var videoPane = obj.videoPanes[i];
              if (videoPane.video.readyState === videoPane.video.HAVE_ENOUGH_DATA && videoPane.lastDrawTime !== videoPane.video.currentTime) {
                  videoPane.context.drawImage(videoPane.video, 0, 0, obj.videoDimensions.width, obj.videoDimensions.height);
                  videoPane.lastDrawTime = videoPane.video.currentTime;
              }
              videoPane.texture.needsUpdate = true;
          }

          // Our preferred controls via DeviceOrientation
          function setOrientationControls(e) {
            if (!e.alpha) {
              return;
            }

            controls = new THREE.DeviceOrientationControls(obj.camera, true);
            controls.connect();
            controls.update();

            window.removeEventListener('deviceorientation', setOrientationControls, true);
          }
          window.addEventListener('deviceorientation', setOrientationControls, true);

          // Render the scene
          effect.render(obj.scene, obj.camera);
      };

      function resize(camera, renderer, effect) {
        var width = glFrame.offsetWidth;
        var height = glFrame.offsetHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        effect.setSize(width, height);
      }


      // VideoPane
      // =====================================================
      //

      function VideoPane(video, dimensions, segments) {
          // Initialize video and position
          this.video = video;
          this.lastDrawTime = -1;

          // Set up material
          this.canvas = this.initCanvas(dimensions.width, dimensions.height);
          this.context = this.initContext(this.canvas);
          this.texture = this.initTexture(this.canvas, segments);
          this.material = this.initMaterial(this.texture);
      }

      VideoPane.prototype.initCanvas = function(width, height) {
          // Set up the canvas
          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          return canvas;
      };

      VideoPane.prototype.initContext = function(canvas) {
          // Style initial context
          var context = this.canvas.getContext('2d');
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          context.fillStyle = '#000000';
          context.fillRect(0, 0, canvas.width, canvas.height);
          return context;
      };

      VideoPane.prototype.initTexture = function(canvas, segments) {
          // Create a repeating texture from the canvas
          var texture = new THREE.Texture(canvas);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(segments.width, segments.height);
          return texture;
      };

      VideoPane.prototype.initMaterial = function(texture) {
          // Create basic material to apply to the sphere
          var material = new THREE.MeshBasicMaterial({
              map: texture
          });
          material.side = THREE.BackSide;
          return material;
      };

      function like() {
        setTimeout(function() {
          if (double > 0) {
            double --;
          } else {
            alert('like');
          }
        }, 300);
      }

      function dislike() {
        double = 2;
        alert('dislike');
      }

      var carousel = new Carousel(document.getElementsByTagName('video'));
      carousel.setupScene();
      carousel.animate();
    }
  }
}]);
