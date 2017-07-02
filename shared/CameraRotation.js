import React, { Component } from 'react';
import { View, TouchableWithoutFeedback, Text, PanResponder } from 'react-native';
import Expo                 from 'expo';
import ExpoTHREE            from 'expo-three';
import * as THREE           from 'three';

import Styles from './CameraRotationStyles.js';

console.disableYellowBox = true;

export default class CameraRotation extends Component {
    state = {
        zoom: 5,
        lon: 0,
        lat: 0,
        fromXY: undefined,
        valueXY: undefined
    }

    handleGLContextCreate = async (gl) => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            100, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

        const renderer = ExpoTHREE.createRenderer({ gl });

        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const geometry = new THREE.CubeGeometry(1, 1, 1);
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
            const { zoom } = this.state;

            requestAnimationFrame(render);

            const lat = Math.max(-85, Math.min(85, this.state.lat));
            const phi = THREE.Math.degToRad(90 - lat);
            const theta = THREE.Math.degToRad(this.state.lon);

            camera.position.x = zoom * Math.sin(phi) * Math.cos(theta);
            camera.position.y = zoom * Math.cos(phi);
            camera.position.z = zoom * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(scene.position);

            renderer.render(scene, camera);

            gl.endFrameEXP();
        };

        render();
    }

    handleMoveEnd = () => {
        this.setState({ fromXY: undefined });
    }

    handleMove = (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const { lat, lon, fromXY = [], valueXY = [] } = this.state;

        if (!this.state.fromXY) {
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
