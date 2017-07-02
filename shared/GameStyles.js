import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1
    },
    buttonBox: {
        position: 'absolute',
        top: 40,
        left: 10,
        width: 50,
        flexDirection: 'row',
        height: 30
    },
    button: {
        width: 25,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
