import React, { Component } from 'react';
import { TabNavigator }     from 'react-navigation';

import CameraRotation from './components/CameraRotation.js';
import ObjectRotation from './components/ObjectRotation.js';

const Tabs = TabNavigator(
    {
        CameraRotation: {
            screen: CameraRotation
        },
        ObjectRotation: {
            screen: ObjectRotation
        }
    }, {
        tabBarOptions: {
            showIcon         : false,
            showLabel        : true,
            upperCaseLabel   : false
        },
        tabBarPosition: 'bottom',
        animationEnabled: false,
        swipeEnabled: false
    }
);

export default class App extends Component {
    render() {
        return (
            <Tabs />
        );
    }
}
