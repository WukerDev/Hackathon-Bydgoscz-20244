import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomDarkTheme,CustomLightTheme } from '../../../Theme';
import { useColorScheme } from 'react-native';
import { StyleSheet } from 'react-native';

const Notifications: React.FC = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
    return (
        <View style={[style.ViewMain]}>
            <Icon name="bell" size={80} color={theme.colors.primary} />
            <Text style={{color: theme.colors.text, fontSize: 30}}>Powiadomienia</Text>
            <Text style={{color: theme.colors.text, fontSize: 20}}>Trwają ciężkie prace nad</Text>
            <Text style={{color: theme.colors.text, fontSize: 20}}>możliwością zarządzania powiadomieniami.</Text>
        </View>
    );
};


const style = StyleSheet.create({
    ViewMain: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Notifications;