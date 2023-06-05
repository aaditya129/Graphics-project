import * as THREE from 'https://threejs.org/build/three.module.js';
        import TWEEN from 'https://dev.jspm.io/@tweenjs/tween.js';
        var matchedCount = 0;
        function restartGame() {
            // Reset matched cubes count
            matchedCount = 0;

            // Reset cube states
            cubes.forEach(function (cube) {
                cube.userData.flipped = false;
                cube.userData.matched = false;
                cube.rotation.y = Math.PI / 2;
                cube.userData.originalRotation = Math.PI / 2;
            });

            // Reset last clicked cube
            lastCube = null;

            // Reload the page
            window.location.reload();
        }


        // Create a scene
        var scene = new THREE.Scene();

        // Create a camera
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create a renderer
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create cubes
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var colors = ['red', 'blue', 'green'];
        var cubes = [];

        for (let i = 0; i < 6; i++) {
            var materials = [];
            for (let j = 0; j < 6; j++) {
                materials.push(new THREE.MeshBasicMaterial({ color: j === 0 ? colors[i % 3] : 'white' }));
            }
            var cube = new THREE.Mesh(geometry, materials);
            cube.position.x = (i % 3) * 1.2 - 1.2;
            cube.position.y = Math.floor(i / 3) * 1.2 - 0.6;
            cube.rotation.y = Math.PI / 2; // Start with the colored side hidden
            cube.userData.flipped = false; // Add a property to keep track of the cube's state
            cubes.push(cube);
            scene.add(cube);
        }

        // Add lighting
        var ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Handle click events
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        var lastCube = null;
        var isFlippingBack = false;

        renderer.domElement.addEventListener('click', function (event) {
            if (isFlippingBack) return; // Ignore clicks when flip back animation is in progress

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(cubes);
            if (intersects.length > 0) {
                var cube = intersects[0].object;
                if (cube.userData.matched) return; // Ignore clicks on cubes that have already been matched

                if (!cube.userData.flipped) {
                    new TWEEN.Tween(cube.rotation)
                        .to({ y: cube.rotation.y - Math.PI }, 500)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onComplete(function () {
                            cube.userData.flipped = true;
                        })
                        .start();

                    if (lastCube) {
                        if (lastCube.material[0].color.equals(cube.material[0].color)) {
                            // The colors match, so mark both cubes as matched
                            lastCube.userData.matched = true;
                            cube.userData.matched = true;
                            matchedCount += 2;

                            if (matchedCount === cubes.length) {
                                // All cubes are matched, game over
                                alert("Congratulations! You've completed the game.");
                                restartGame();
                            }
                        } else {
                            // The colors don't match, so flip both cubes back to their original positions
                            isFlippingBack = true; // Prevent further clicks during the flip back animation

                            new TWEEN.Tween(cube.rotation)
                                .to({ y: cube.userData.originalRotation }, 500)
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .onComplete(function () {
                                    cube.userData.flipped = false;
                                    isFlippingBack = false; // Allow clicks again after the flip back animation
                                })
                                .start();

                            new TWEEN.Tween(lastCube.rotation)
                                .to({ y: lastCube.userData.originalRotation }, 500)
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .onComplete(function () {
                                    lastCube.userData.flipped = false;
                                })
                                .start();

                            // Game over alert
                            alert("Game Over! Try again.");
                            restartGame();
                        }

                        lastCube = null;
                    } else {
                        lastCube = cube;
                    }

                } else {
                    // If the clicked cube is already flipped, ignore the click
                }
            }
        });

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            TWEEN.update();
            renderer.render(scene, camera);
        }
        animate();