import React, { Component } from 'react';
import { View, TouchableWithoutFeedback, Text, PanResponder } from 'react-native';
import Expo                 from 'expo';
import ExpoTHREE            from 'expo-three';
import * as THREE           from 'three';

import { calcDistance } from '../utils/functions.js';

import Styles from './CameraRotationStyles.js';

console.disableYellowBox = true;

export default class CameraRotation extends Component {
    state = {
        isScaling: false,
        zoom: 3,
        lon: 0,
        lat: 0,
        fromXY: undefined,
        valueXY: undefined,
        scale: 1
    }

    handleGLContextCreate = async (gl) => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            100, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

        const renderer = ExpoTHREE.createRenderer({ gl });

        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: await ExpoTHREE.createTextureAsync({
                asset: Expo.Asset.fromModule(require('../assets/redSquare.png'))
            })
        });
        const cube = new THREE.Mesh(geometry, material);

        const light = new THREE.PointLight(0xffffff, 1, 100);

        light.position.set(0, 10, 0);
        light.castShadow = true;
        scene.add(light);

        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;

        scene.add(cube);

        const helper = new THREE.CameraHelper(light.shadow.camera);

        scene.add(helper);

        const render = () => {
            const { zoom, scale } = this.state;

            requestAnimationFrame(render);

            cube.scale.set(1 * scale, 1 * scale, 1 * scale);

            cube.rotation.x = this.state.lat;
            cube.rotation.y = this.state.lon;

            camera.position.z = zoom;

            camera.lookAt(scene.position);

            renderer.render(scene, camera);

            gl.endFrameEXP();
        };

        render();
    }

    handleMoveEnd = () => {
        this.setState({ fromXY: undefined, isZooming: false });
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
                lon: valueXY[0] + (locationX - fromXY[0]) / 40,
                lat: valueXY[1] + (locationY - fromXY[1]) / 40
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
        const { isScaling, initialDistance, scale } = this.state;
        const distance = calcDistance(x1, y1, x2, y2);

        if (!isScaling) {
            this.setState({ isScaling: true, initialDistance: distance });
        } else if (Math.abs(distance - initialDistance) > 5) {
            this.setState({
                scale: distance > initialDistance
                    ? scale + 0.07
                    : scale - 0.07,
                initialDistance: distance
            });
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
                    style           = {Styles.container}
                    onContextCreate = {this.handleGLContextCreate}
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
