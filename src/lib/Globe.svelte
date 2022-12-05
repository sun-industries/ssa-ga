<script lang="ts">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import Stats from 'three/examples/jsm/libs/stats.module'
    import { onMount } from 'svelte';
    import earthTexture from './assets/eo_base_2020_clean_3600x1800.png';

    const USE_STATS = false;
    const CAMERA_GROUND = !true;// not working

    export let draw : Function = function(time:Date) {}
    export let update: Function = function(sunLat:number, sunLon:number, sats:{}) {}
    export let lookAt: Function = function(lat:number, lang:number, alt:number) {}

    let domNode: Element;
    const solarTile = { pos: [0,0] };
    type SolatTile = { pos: [0,0] };

    function antipodalPoint(lat, lon) {
        return [
            -lat,
            (lon < 0) ? lon + 180 : lon - 180
        ];
    }

    onMount(async () => {
        
        const ThreeGlobe = (await import('three-globe')).default;

        // @ts-ignore
        const globe = new ThreeGlobe({
            //animateIn: false
        })
        .globeImageUrl(earthTexture)
        .showAtmosphere(false)
        //.pointsData(gData)
        .pointAltitude('size')
        .pointColor('color');

        // This is for the solar mark
        globe.tilesData([solarTile])
        .tileLat((d:SolatTile) => d.pos[0])
        .tileLng((d:SolatTile) => d.pos[1])
        .tileAltitude(0.005)
        .tileWidth(180)
        .tileHeight(180)
        .tileUseGlobeProjection(false)
        .tileMaterial(() => new THREE.MeshLambertMaterial({ color: '#000000', opacity: 0.2, transparent: true }))
        .tilesTransitionDuration(0);

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

        const AA = window.devicePixelRatio <= 1;
        const renderer = new THREE.WebGLRenderer({
            antialias: AA,
            powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( 0.8 /*window.devicePixelRatio*/ );
        domNode.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);//(0xf8fafc);
        scene.add(globe);
        scene.add(new THREE.AmbientLight(0xffffff));
        //scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

        /*var axesHelper = new THREE.AxesHelper(500);
	    scene.add(axesHelper);*/

        const camera = new THREE.PerspectiveCamera();
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        camera.position.z = 500;

        let tbControls;
        if(CAMERA_GROUND) {
            camera.position.set(0, 0, 0);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        } //else {
            tbControls = new OrbitControls(camera, renderer.domElement);
            tbControls.minDistance = 101;
            tbControls.rotateSpeed = 5;
            tbControls.zoomSpeed = 0.8;
        //}

        const stats = Stats()
        if(USE_STATS) {
            domNode.appendChild(stats.dom);
        }

        const dotGeometry = new THREE.BufferGeometry();
		dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0], 3));
        const dotMaterial = new THREE.PointsMaterial({
            size: 1.5,
            fog: false,
            color: /*item.color ||*/ 0xff61d5
        });

        globe.customThreeObject(item => {
            if(item.type === 'sat') {
			    return new THREE.Points(dotGeometry, dotMaterial.clone());
            }
            if(item.type === 'obs') {
                return new THREE.Mesh( geometry, material );
            }
		}).customThreeObjectUpdate((satPixel, item) => {
			Object.assign(satPixel.position, globe.getCoords(item.lat, item.lng, item.alt));
            
            if(item.type === 'sat') {
			    satPixel.material.color.set(item.color);
                //console.log('item.sunlit', item.sunlit, satPixel.material.color, item.sunlit ? 0xff0000 : 0x000000)
            } else {
                satPixel.lookAt(scene.localToWorld(new THREE.Vector3(0, 0, 0)));
            }
		}).onGlobeReady(() => {

            update = (sunLat, sunLon, data) => {
                solarTile.pos = antipodalPoint(sunLat, sunLon);
                globe.tilesData([solarTile]).customLayerData(data);
            };

            draw = (time: Date) => {
                if(CAMERA_GROUND) {
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                    console.log(camera.position)
                } //else {
                    tbControls.update(); // todo: is this neccesary?
                //}
                renderer.render(scene, camera);
                USE_STATS && stats.update()
            }

            lookAt = (lat: number, lng: number, alt: number) => {
                camera.position = globe.getCoords(lat, lng, alt)
            }
        });

        function onResize () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        onResize();
        window.addEventListener('resize', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize, true);
        }

    });

</script>
<svelte:options accessors={true} />

<div bind:this={domNode}></div>