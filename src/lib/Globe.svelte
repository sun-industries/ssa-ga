<script lang="ts">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import Stats from 'three/examples/jsm/libs/stats.module'
    
    import { onMount } from 'svelte';
    import earthTexture from './assets/eo_base_2020_clean_3600x1800.png';

    const USE_STATS = false;
    const CAMERA_GROUND = !true;

    export let draw : Function = function(time:Date) {}
    export let update: Function = function(items:{}) {}

    let domNode: Element;

    onMount(async () => {
        
        const ThreeGlobe = (await import('three-globe')).default;

        // @ts-ignore
        const globe = new ThreeGlobe()
            .globeImageUrl(earthTexture)
            .showAtmosphere(false)
            //.pointsData(gData)
            .pointAltitude('size')
            .pointColor('color');

        const dotGeometry = new THREE.BufferGeometry();
		dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
        const dotMaterial = new THREE.PointsMaterial({
            size: 2.0,
            fog: false,
            color: /*item.color ||*/ '#006bcc'
        });

        // todo
        const geometry = new THREE.ConeGeometry( 30, 10.3, 24, 1, true );
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -5));
        const material = new THREE.MeshBasicMaterial({
            color: 0xf604ee,
            //wireframe: true,
            side: THREE.DoubleSide,
            opacity: 0.10,
            //depthTest: false,
            //vertexColors: true,
            transparent: true
        });

        // @ts-ignore
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        domNode.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);//(0xf8fafc);
        scene.add(globe);
        scene.add(new THREE.AmbientLight(0xffffff));
        //scene.add(new THREE.DirectionalLight(0xffffff, 0.6));


        const camera = new THREE.PerspectiveCamera();
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        camera.position.z = 500;

        const tbControls = new OrbitControls(camera, renderer.domElement);
        tbControls.minDistance = 101;
        tbControls.rotateSpeed = 5;
        tbControls.zoomSpeed = 0.8;

        const stats = Stats()
        if(USE_STATS) {
            domNode.appendChild(stats.dom);
        }

        globe.customThreeObject(item => {
            if(item.type === 'sat') {
			    return new THREE.Points(dotGeometry, dotMaterial);
            }
            if(item.type === 'obs') {
                return new THREE.Mesh( geometry, material );
            }
		}).customThreeObjectUpdate((satPixel, item) => {
			Object.assign(satPixel.position, globe.getCoords(item.lat, item.lng, item.alt));
            satPixel.lookAt(scene.localToWorld(new THREE.Vector3(0, 0, 0)));

            if(item.type === 'sat') {
			    satPixel.material.color.setHex(item.color);
            }
		});

        update = (data) => globe.customLayerData(data);
        
        //renderer.setPixelRatio( window.devicePixelRatio );

        if(CAMERA_GROUND) {
            camera.position.set(0, 210, 0);
        }

        draw = (time: Date) => {
            tbControls.update(); // todo: is this neccesary?
            if(CAMERA_GROUND) {
                camera.lookAt(new THREE.Vector3(0, 190, -50));
            }
            renderer.render(scene, camera);
            USE_STATS && stats.update()
        }

        /*(function animate() { // IIFE
            // Frame cycle
            tbControls.update();
            renderer.render(scene, camera);
            time = new Date()
            timeStr = time.toISOString();
            requestAnimationFrame(animate);
        })();*/

    });

</script>
<svelte:options accessors={true} />

<div bind:this={domNode}></div>