import React, { Component } from 'react';
import { View, TouchableWithoutFeedback, Text, PanResponder, Dimensions } from 'react-native';
import Expo                 from 'expo';
import ExpoTHREE            from 'expo-three';
import * as THREE           from 'three';

import Styles from './GameStyles.js';

console.disableYellowBox = true;

const window = Dimensions.get('window');
const centerY = window.height / 2;
const centerX = window.width / 2;

export default class Game extends Component {
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
            75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);

        const renderer = ExpoTHREE.createRenderer({ gl });

        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: await ExpoTHREE.createTextureAsync({
                asset: Expo.Asset.fromModule(require('../assets/square.png'))
            })
        });
        const cube = new THREE.Mesh(geometry, material);

        scene.add(cube);

        const render = () => {
            const { zoom } = this.state;

            requestAnimationFrame(render);

            const phi = THREE.Math.degToRad(90 - this.state.lat);
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
        const { lat, lon, fromXY, valueXY } = this.state;

        if (!this.state.fromXY) {
            this.setState({
                fromXY: [locationX, locationY],
                valueXY: [lon, lat]
            });
        } else {
            this.setState({ lon: valueXY[0] + (locationX - fromXY[0]) / 2 });
            this.setState({ lat: valueXY[1] + (locationY - fromXY[1]) / 2 });
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
        onResponderRelease: this.handleMoveEnd
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
