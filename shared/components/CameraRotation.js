import React, { Component } from 'react';
import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import * as THREE from 'three';
import { View, TouchableWithoutFeedback, Text, PanResponder } from 'react-native';

import { calcDistance } from '../utils/functions.js';

import Styles from './CameraRotationStyles.js';

console.disableYellowBox = true;

export default class CameraRotation extends Component {
    state = {
        zoom: 1200,
        zoomZ: 0,
        lon: 0,
        lat: 0,
        fromXY: undefined,
        valueXY: undefined
    }

    handleGLContextCreate = async (gl) => {
        var mixer1, mixer2, mesh1, mesh2;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 10000);

        const cameraTarget = new THREE.Vector3(0, 150, 0);



        const renderer = ExpoTHREE.createRenderer({ gl });

        renderer.setClearColor(0xf0f0f0);
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const light1 = new THREE.DirectionalLight(0xefefff, 2.3);

        light1.position.set(1, 1, 1).normalize();
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffefef, 1.5);

        light2.position.set(-1, -1, -1).normalize();
        scene.add(light2);

        const loader = new THREE.JSONLoader();

        loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/animated/horse.js', geometry => {
            const material = new THREE.MeshLambertMaterial({
                vertexColors: THREE.FaceColors,
                morphTargets: true,
                overdraw: 0.5
            });

            mesh1 = new THREE.Mesh(geometry, material);

            mesh1.scale.set(1.5, 1.5, 1.5);
            scene.add(mesh1);

            mesh2 = new THREE.Mesh(geometry, material);

            mesh2.scale.set(1.5, 1.5, 1.5);
            scene.add(mesh2);

            mixer1 = new THREE.AnimationMixer(mesh1);

            const clip1 = THREE.AnimationClip.CreateFromMorphTargetSequence('gallop', geometry.morphTargets, 30);

            mixer1.clipAction(clip1).setDuration(1).play();

            mixer2 = new THREE.AnimationMixer(mesh2);

            const clip2 = THREE.AnimationClip.CreateFromMorphTargetSequence('gallop', geometry.morphTargets, 30);

            mixer2.clipAction(clip2).setDuration(1).play();
        });

        let prevTime = Date.now();

        const render = () => {
            const { zoom, zoomZ } = this.state;

            if (mixer1 && mixer2) {
                const time = Date.now();

                mixer1.update((time - prevTime) * 0.001);

                mixer2.update((time - prevTime) * 0.002);

                prevTime = time;
            }

            requestAnimationFrame(render);

            const lat = Math.max(-85, Math.min(85, this.state.lat));
            const phi = THREE.Math.degToRad(90 - lat);
            const theta = THREE.Math.degToRad(this.state.lon);

            mesh1.position.x = 200;
            mesh1.position.z = 1000;

            this.setState({ zoomZ: this.state.zoomZ + 2 });

            mesh2.position.z += 2;

            cameraTarget.x = mesh2.position.x;
            cameraTarget.z = mesh2.position.z;

            camera.lookAt(cameraTarget);

            camera.position.x = zoom * Math.sin(phi) * Math.cos(theta);
            camera.position.y = zoom * Math.cos(phi);
            camera.position.z = zoom * Math.sin(phi) * Math.sin(theta) + zoomZ;

            renderer.render(scene, camera);

            gl.endFrameEXP();
        };

        render();
    }

    handleMoveEnd = () => {
        this.setState({ fromXY: undefined });
    }

    handleMove = (e) => {
        const { locationX, locationY, touches } = e.nativeEvent;
        const { lat, lon, fromXY = [], valueXY = [] } = this.state;

        if (touches.length === 2) {
            this.processPinch(touches[0].pageX, touches[0].pageY,
                touches[1].pageX, touches[1].pageY);
        } else if (!this.state.fromXY) {
            this.setState({
                fromXY: [locationX, locationY],
                valueXY: [lon, lat]
            });
        } else {
            this.setState({
                lon: valueXY[0] + (locationX - fromXY[0]) / 2,
                lat: valueXY[1] + (locationY - fromXY[1]) / 2
            });
        }
    }

    handleZoomIn = () => {
        this.setState({ zoom: --this.state.zoom });
    }

    handleZoomOut = () => {
        this.setState({ zoom: ++this.state.zoom });
    }

    processPinch(x1, y1, x2, y2) {
        const { isZooming, initialDistance, zoom } = this.state;
        const distance = calcDistance(x1, y1, x2, y2);

        if (!isZooming) {
            this.setState({ isZooming: true, initialDistance: distance });
        } else if (Math.abs(distance - initialDistance) > 5) {
            this.setState({ zoom: distance > initialDistance ? zoom - 50 : zoom + 50, initialDistance: distance });
        }
    }

    panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: this.handleMove,
        onPanResponderRelease: this.handleMoveEnd
    });

    render() {
        return (
            <View style={Styles.container}>
                <Expo.GLView
                    {...this.viewProps}
                    {...this.panResponder.panHandlers}
                    style={Styles.container}
                    onContextCreate={this.handleGLContextCreate}
                />

                <View style={Styles.buttonBox}>
                    <TouchableWithoutFeedback onPress={this.handleZoomIn}>
                        <View style={Styles.button}>
                            <Text>+</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={this.handleZoomOut}>
                        <View style={Styles.button}>
                            <Text>-</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }

}
